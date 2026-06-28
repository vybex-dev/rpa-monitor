// src/utils/analytics.js
// Analytics aggregation helpers for the Paused-State Analytics Overlay (Bounty 2).
//
// All functions accept the activeViewPool (Object[]) already produced by
// useViewPool — they do NOT create a second data pipeline.
//
// Each function performs a single-pass O(n) reduce (one loop per chart).

const TOP_N = 8; // max automation_type buckets before collapsing into "Other"

/**
 * Bar chart: sum of annual_savings_usd grouped by department.
 * @param {Object[]} rows — activeViewPool
 * @returns {{ labels: string[], data: number[] }}
 */
export function aggregateSavingsByDepartment(rows) {
  const sums = new Map();
  for (const row of rows) {
    const dept = row.department || 'Unknown';
    const savings = parseFloat(row.annual_savings_usd) || 0;
    sums.set(dept, (sums.get(dept) ?? 0) + savings);
  }

  // Sort descending by savings so the chart reads naturally
  const sorted = [...sums.entries()].sort((a, b) => b[1] - a[1]);
  return {
    labels: sorted.map(([k]) => k),
    data: sorted.map(([, v]) => Math.round(v)),
  };
}

/**
 * Doughnut chart: count of records grouped by project_status.
 * @param {Object[]} rows — activeViewPool
 * @returns {{ labels: string[], data: number[] }}
 */
export function aggregateCountByStatus(rows) {
  const counts = new Map();
  for (const row of rows) {
    const status = row.project_status || 'Unknown';
    counts.set(status, (counts.get(status) ?? 0) + 1);
  }

  // Deterministic label order
  const ORDER = ['Active', 'Completed', 'Planned', 'Unknown'];
  const ordered = ORDER.filter((s) => counts.has(s));
  // Append any values not in the predefined order list
  for (const k of counts.keys()) {
    if (!ORDER.includes(k)) ordered.push(k);
  }

  return {
    labels: ordered,
    data: ordered.map((k) => counts.get(k) ?? 0),
  };
}

/**
 * Bar chart: average roi_percent grouped by automation_type.
 * If there are more than TOP_N distinct values, keep the TOP_N by row count
 * and collapse the rest into an "Other" bucket.
 *
 * @param {Object[]} rows — activeViewPool
 * @returns {{ labels: string[], data: number[] }}
 */
export function aggregateAvgRoiByAutomationType(rows) {
  // Single pass: accumulate sum + count per type
  const acc = new Map(); // type → { sum, count }
  for (const row of rows) {
    const type = row.automation_type || 'Unknown';
    const roi = parseFloat(row.roi_percent) || 0;
    const entry = acc.get(type);
    if (entry) {
      entry.sum += roi;
      entry.count += 1;
    } else {
      acc.set(type, { sum: roi, count: 1 });
    }
  }

  // Sort by count descending (most-prevalent types first)
  const sorted = [...acc.entries()].sort((a, b) => b[1].count - a[1].count);

  let labels = [];
  let data = [];

  if (sorted.length <= TOP_N) {
    labels = sorted.map(([k]) => k);
    data = sorted.map(([, v]) => +(v.sum / v.count).toFixed(1));
  } else {
    // Top N buckets
    const top = sorted.slice(0, TOP_N);
    const rest = sorted.slice(TOP_N);

    labels = top.map(([k]) => k);
    data = top.map(([, v]) => +(v.sum / v.count).toFixed(1));

    // Collapse remainder into "Other"
    let otherSum = 0;
    let otherCount = 0;
    for (const [, v] of rest) {
      otherSum += v.sum;
      otherCount += v.count;
    }
    if (otherCount > 0) {
      labels.push('Other');
      data.push(+(otherSum / otherCount).toFixed(1));
    }
  }

  return { labels, data };
}
