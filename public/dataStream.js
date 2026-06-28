/**
 * ============================================================================
 * RPA MONITOR — TELEMETRY PIPELINE ENGINE  (public/dataStream.js)
 * ============================================================================
 * Exposes two globals:
 *   window.initializeRpaStream(callback, csvUrl)
 *   window.rpaStreamControl  →  { pause(), resume() }
 *
 * CORRECTED from hackathon scaffold:
 *   - Removed bogus fields (annual_revenue_usd, customer_count,
 *     market_share_percent, employee_count) that do NOT exist in the CSV.
 *   - Mutates REAL fields: budget_usd, annual_savings_usd,
 *     roi_percent, employee_hours_saved.
 *   - Proper numeric casting for all real numeric columns.
 *   - Pause/resume with internal queue so NO ticks are dropped.
 * ============================================================================
 */

(function () {

  // ── Internal state ──────────────────────────────────────────────────────────

  /** Full parsed dataset — lives in RAM after the initial fetch. */
  let memoryPool = [];

  /** Whether the stream interval has been started at least once. */
  let isInitialized = false;

  /** When paused, incoming batches are pushed here instead of sent to the callback. */
  let isPaused = false;
  let pendingQueue = [];

  /** Reference to the setInterval handle (needed if we ever want to stop). */
  let intervalHandle = null;

  // ── Helpers ─────────────────────────────────────────────────────────────────

  /**
   * Returns a random float in [min, max).
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  const randomRange = (min, max) => Math.random() * (max - min) + min;

  /**
   * Returns a random integer in [min, max).
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  const randomInt = (min, max) => Math.floor(randomRange(min, max));

  /**
   * Clamps value to [lo, Infinity) — used for fields that can't go below a floor.
   * roi_percent is intentionally NOT clamped here (it can be negative).
   * @param {number} value
   * @param {number} lo
   * @returns {number}
   */
  const clampLow = (value, lo) => Math.max(lo, value);

  // ── CSV Parser ───────────────────────────────────────────────────────────────

  /**
   * Parses the CSV text into an array of row objects.
   * Handles the exact schema of automation_projects.csv:
   *   project_id, company_id, project_name, start_date, completion_date,
   *   project_status, automation_type, robots_deployed, budget_usd,
   *   annual_savings_usd, roi_percent, department, implementation_partner,
   *   country, industry, employee_hours_saved, ai_enabled, cloud_deployment
   *
   * Numeric columns cast:
   *   robots_deployed        → integer
   *   budget_usd             → integer
   *   annual_savings_usd     → integer
   *   employee_hours_saved   → integer
   *   roi_percent            → float (2 decimal places)
   *
   * @param {string} csvText
   * @returns {Array<Object>}
   */
  const parseCSV = (csvText) => {
    console.log('⚡ [RPA Engine] Parsing CSV into memory pool...');

    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    // The columns we must cast to numbers (integers)
    const integerCols = new Set([
      'robots_deployed',
      'budget_usd',
      'annual_savings_usd',
      'employee_hours_saved',
    ]);

    const parsedRows = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',');
      if (values.length !== headers.length) continue; // skip malformed rows

      const row = {
        // Stable identity key — used by the UI for keyed reconciliation
        internal_uid: `uid-${i}`,
      };

      headers.forEach((header, idx) => {
        const raw = values[idx].trim();

        if (integerCols.has(header)) {
          row[header] = parseInt(raw, 10) || 0;
        } else if (header === 'roi_percent') {
          row[header] = parseFloat(parseFloat(raw).toFixed(2)) || 0.00;
        } else {
          row[header] = raw; // string metadata
        }
      });

      parsedRows.push(row);
    }

    console.log(`✅ [RPA Engine] Loaded ${parsedRows.length} rows into RAM.`);
    return parsedRows;
  };

  // ── Mutation Engine ──────────────────────────────────────────────────────────

  /**
   * Produces one mutated clone of a single row.
   * The mutation strategy uses REAL CSV fields only.
   *
   * Anomaly path (~5% of rows per tick):
   *   - Large spike/crash in budget_usd and annual_savings_usd
   *   - roi_percent can go negative  ← this is the alert trigger for Feature 3
   *   - Occasionally flip project_status to 'Failed'
   *
   * Normal path (95%):
   *   - Small realistic noise on all four numeric fields
   *
   * @param {Object} row — original row from memoryPool (will NOT be mutated directly)
   * @returns {Object} — mutated clone
   */
  const mutateRow = (row) => {
    const clone = { ...row };
    const isAnomaly = Math.random() < 0.05; // 5% anomaly rate

    if (isAnomaly) {
      // ── Anomaly: large swing, possible negative ROI, possible status flip ──

      clone.budget_usd += randomInt(-500_000, 1_000_000);
      clone.annual_savings_usd += randomInt(-300_000, 600_000);
      // roi_percent deliberately allowed to go negative — drives Feature 3 alerts
      clone.roi_percent = parseFloat(
        (clone.roi_percent + randomRange(-80, 30)).toFixed(2)
      );
      clone.employee_hours_saved += randomInt(-5_000, 10_000);

      // ~40% of anomalies also flip the status to Failed
      if (Math.random() < 0.4) {
        clone.project_status = 'Failed';
      }

    } else {
      // ── Normal: small operational noise ──

      clone.budget_usd        += randomInt(-5_000, 15_000);
      clone.annual_savings_usd += randomInt(-3_000, 8_000);
      clone.roi_percent        = parseFloat(
        (clone.roi_percent + randomRange(-2, 2)).toFixed(2)
      );
      clone.employee_hours_saved += randomInt(-100, 500);
    }

    // ── Clamp floors (roi_percent is exempt — it CAN be negative) ──
    clone.budget_usd          = clampLow(clone.budget_usd, 0);
    clone.annual_savings_usd  = clampLow(clone.annual_savings_usd, 0);
    clone.employee_hours_saved = clampLow(clone.employee_hours_saved, 0);
    clone.robots_deployed     = clampLow(clone.robots_deployed, 0);
    // roi_percent: intentionally unclamped — can go negative

    return clone;
  };

  // ── Tick Handler ─────────────────────────────────────────────────────────────

  /**
   * Called every 200ms by setInterval.
   * Picks a random batch of 5–50 rows, mutates them, writes back to the pool,
   * then either fires the callback immediately or enqueues while paused.
   *
   * @param {Function} callback
   */
  const tick = (callback) => {
    if (memoryPool.length === 0) return;

    const batchSize = randomInt(5, 51); // 5 to 50 inclusive
    const batch = [];

    for (let i = 0; i < batchSize; i++) {
      const targetIdx = randomInt(0, memoryPool.length);
      const mutated = mutateRow(memoryPool[targetIdx]);

      // Write mutation back so the pool evolves over time
      memoryPool[targetIdx] = mutated;
      batch.push(mutated);
    }

    if (isPaused) {
      // Store for later — no callback yet
      pendingQueue.push(...batch);
    } else {
      callback(batch);
    }
  };

  // ── Pause / Resume Control ───────────────────────────────────────────────────

  /**
   * Creates the rpaStreamControl object and exposes it on window.
   * pause()  — stops UI updates; engine continues mutating + queueing internally.
   * resume() — flushes the entire queue in one callback, then resumes live ticks.
   *
   * This is the foundation for Feature 5 (Pipeline Buffer Control / Pause·Play).
   * The UI for it will be built in a later phase.
   *
   * @param {Function} callback
   */
  const attachStreamControl = (callback) => {
    window.rpaStreamControl = {
      pause() {
        if (isPaused) return;
        isPaused = true;
        console.log('⏸  [RPA Engine] Stream paused — queueing internally.');
      },

      resume() {
        if (!isPaused) return;
        isPaused = false;
        console.log(`▶️  [RPA Engine] Resuming — flushing ${pendingQueue.length} queued rows.`);

        if (pendingQueue.length > 0) {
          // Flush everything accumulated while paused in one shot
          callback([...pendingQueue]);
          pendingQueue = [];
        }
      },

      get isPaused() {
        return isPaused;
      },

      get queueLength() {
        return pendingQueue.length;
      },
    };
  };

  // ── Public Init Hook ─────────────────────────────────────────────────────────

  /**
   * Fetches the CSV, parses it, starts the 200ms tick loop.
   *
   * Usage (in your React component):
   *   useEffect(() => {
   *     if (window.initializeRpaStream) {
   *       window.initializeRpaStream(
   *         (batch) => dispatch({ type: 'MERGE_BATCH', payload: batch }),
   *         '/automation_projects.csv'
   *       );
   *     }
   *   }, []);
   *
   * @param {Function} callback  — receives Array<rowObject> every 200ms
   * @param {string}   csvUrl    — path to the CSV file (default: /automation_projects.csv)
   */
  window.initializeRpaStream = async function (callback, csvUrl = '/automation_projects.csv') {
    if (typeof callback !== 'function') {
      console.error('❌ [RPA Engine] initializeRpaStream requires a callback function.');
      return;
    }

    if (isInitialized) {
      console.warn('⚠️  [RPA Engine] Stream already initialized — ignoring duplicate call.');
      return;
    }

    try {
      console.log(`📦 [RPA Engine] Fetching CSV from: ${csvUrl}`);
      const response = await fetch(csvUrl);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} — cannot load ${csvUrl}`);
      }

      const csvText = await response.text();
      memoryPool = parseCSV(csvText);
      isInitialized = true;

      // Wire up pause/resume control before the interval starts
      attachStreamControl(callback);

      console.log('🚀 [RPA Engine] Starting 200ms telemetry firehose...');
      intervalHandle = setInterval(() => tick(callback), 200);

    } catch (err) {
      console.error('❌ [RPA Engine] Failed to initialize stream:', err.message);
      console.error('   ↳ Checklist: Is automation_projects.csv in /public? Is the dev server running?');
    }
  };

})();
