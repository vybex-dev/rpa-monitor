# PROGRESS.md — Paste this entire file at the start of every new chat session

---

## Stack

- **Framework**: React 19 + Vite 6 (plain JavaScript, not TypeScript)
- **Node**: v22.x | **npm**: v10.x
- **Deployment target**: Static site (100% client-side — zero server code ever)

---

## Folder Structure (as built)

```
rpa-monitor/
├── public/
│   ├── dataStream.js           ← Corrected telemetry engine
│   └── automation_projects.csv ← Real 50,000-row dataset
├── src/
│   ├── components/
│   │   ├── KpiBar.jsx          ← Feature 1: three live KPI counters (Phase 1, unchanged)
│   │   ├── AlertRowList.jsx    ← Phase 1 placeholder (not on main render path)
│   │   ├── SortableTable.jsx   ← Phase 2 (SUPERSEDED by VirtualGrid)
│   │   ├── Toolbar.jsx         ← Phase 2: search box + categorical dropdown filters
│   │   └── VirtualGrid.jsx     ← Phase 3+4: virtualized grid + frozen overlay + multi-sort headers
│   ├── hooks/
│   │   ├── useStreamState.js   ← Central stream state engine
│   │   ├── useSortState.js     ← Phase 2 (SUPERSEDED by useMultiSortState in Phase 4)
│   │   ├── useMultiSortState.js← Feature 9: compound sort stack (NEW Phase 4)
│   │   ├── useFilterState.js   ← Feature 7: multi-select Set-based filter state
│   │   ├── useViewPool.js      ← THE PIPELINE: filter→search→sort → activeViewPool
│   │   ├── useVirtualGrid.js   ← Phase 3: row recycling engine (imperative DOM)
│   │   ├── usePauseQueue.js    ← Feature 5: React-side pause/queue/flush bridge (NEW Phase 4)
│   │   └── useLayoutVisibility.js ← Feature 6: localStorage panel visibility (NEW Phase 4)
│   ├── styles/
│   │   ├── KpiBar.module.css
│   │   ├── AlertRowList.module.css
│   │   ├── SortableTable.module.css
│   │   ├── Toolbar.module.css
│   │   └── VirtualGrid.module.css  ← Phase 3+4: grid styles + overlay + sort badge
│   ├── utils/
│   │   ├── formatters.js       ← Feature 2: formatCurrency, formatPercent, isAlertRow
│   │   ├── sortRows.js         ← Phase 4 upgraded: accepts array or single sort config
│   │   ├── filterRows.js
│   │   └── searchRows.js
│   ├── App.jsx                 ← Phase 4 updated: wires F5+F6+F9 + all prior features
│   ├── App.css                 ← Phase 4 updated: pause button + layout toggle styles
│   ├── index.css               ← Empty
│   └── main.jsx                ← React entry — StrictMode removed
├── index.html
├── PROGRESS.md
├── package.json
├── vite.config.js
└── ... (standard Vite scaffolding)
```

---

## Naming Conventions

- Components: PascalCase files in `src/components/`
- Hooks: camelCase prefixed with "use" in `src/hooks/`
- Utils: camelCase in `src/utils/`
- Styles: CSS Modules named after their component
- No index.js barrel files — import directly by path

---

## dataStream.js — What It Does

**File**: `public/dataStream.js`

### Exposes on `window`
```js
window.initializeRpaStream(callback, csvUrl)
window.rpaStreamControl  // { pause(), resume(), isPaused, queueLength }
```

### Pause/Resume contract
- `pause()` sets internal `isPaused = true`; subsequent ticks push rows to `pendingQueue` instead of calling callback
- `resume()` sets `isPaused = false`, then immediately calls `callback([...pendingQueue])` in one flush, then clears queue
- `queueLength` getter returns `pendingQueue.length` (live count while paused)
- React UI reads this via `usePauseQueue.js`

---

## Real CSV Columns

```
project_id, company_id, project_name, start_date, completion_date,
project_status, automation_type, robots_deployed, budget_usd,
annual_savings_usd, roi_percent, department, implementation_partner,
country, industry, employee_hours_saved, ai_enabled, cloud_deployment
```

---

## useStreamState Hook — Shape & Contract

**File**: `src/hooks/useStreamState.js` (unchanged from Phase 3)

```js
const { kpis, recentRows, rowMap } = useStreamState();
```

- Uses `useReducer` — single dispatch per 200ms batch
- KPI sums maintained incrementally (O(batch_size), not O(total_rows))
- `rowMap` is a `new Map(prev)` copy-on-write — safe as useMemo dependency
- The engine's `resume()` flush fires `callback(batch)` synchronously, which
  lands in `handleBatch` → single `dispatch({ type: 'BATCH', batch })`

---

## ★ THE ACTIVE VIEW POOL PIPELINE

**File**: `src/hooks/useViewPool.js` (unchanged from Phase 3)

### Usage
```js
const { activeViewPool, totalCount, filteredCount } = useViewPool({
  rowMap,
  filters,
  searchQuery,
  sortConfig: sortStack,   // Phase 4: array of { key, dir } — sortRows.js handles both
});
```

### Pipeline
```
rowMap → materialize → filterRows → searchRows → sortRows → activeViewPool
```

`sortRows.js` now accepts either a legacy single `{ key, dir }` object OR an array `[{ key, dir }, ...]`. The pipeline passes `sortStack` (array) directly — no adapter needed.

---

## ★ PHASE 3 — Virtualized Grid Architecture (Feature 8)

(Unchanged from Phase 3 — see Phase 3 notes. Phase 4 adds overlay and new header props only.)

### Phase 4 changes to VirtualGrid.jsx
- `GridHeader` now accepts `sortStack`, `handleSort(key, shiftHeld)`, `getSortMeta(key)`
- Header cells call `handleSort(col.key, e.shiftKey)` on click — shift detection in the click event
- Priority badge (`.sortPriority` CSS module class) renders `1`, `2`, `3` next to sort arrow when multi-sort active
- `.gridBody` wrapper div added between `.gridShell` and `.outerScroll` — allows overlay to cover scroll area only
- `FrozenOverlay` component renders inside `.gridBody` when `isPaused === true`
- Repaint guard: `useEffect` for `activeViewPool` checks `isPausedRef.current` before calling `repaint()` — frozen grid doesn't update visually

### Frozen grid correctness
- `activeViewPoolRef.current` IS updated every tick even while paused (the `useEffect` that sets it has no pause guard)
- Only the `repaint()` call is skipped while paused
- On unpause, a second `useEffect` (watching `isPaused`) calls `repaint()` once — single atomic visual catch-up
- Scroll position is NOT reset by pause/resume (repaint reads current `startIndexRef.current`)

---

## ★ PHASE 4 — Feature 5: Pause/Play Queue Mechanism

**File**: `src/hooks/usePauseQueue.js`

### Architecture
The engine already handles internal queueing. The React side adds:
1. **UI state**: `isPaused` (boolean, React state) — drives overlay and button appearance
2. **Badge ticker**: `setInterval` at 200ms reads `window.rpaStreamControl.queueLength` to update displayed count while paused
3. **Toggle flow**:
   - On pause: `ctrl.pause()` → `setIsPaused(true)` → start badge ticker
   - On resume: stop ticker → `ctrl.resume()` (engine flushes → `handleBatch` dispatch) → `setIsPaused(false)` → `setQueueLength(0)`

### Why this approach
- The engine's `resume()` fires `callback(batch)` synchronously before returning
- `callback` is `useStreamState`'s `handleBatch` → dispatches to reducer
- React batches the `dispatch` + `setIsPaused(false)` into one render commit
- Result: KPIs and grid catch up in one paint, not incrementally

### Queue ref note
The engine's `pendingQueue` is not a React ref — it's a plain JS array inside the IIFE closure. No React re-renders occur while rows accumulate there. Only `setQueueLength` (from the badge ticker) triggers a render, and only once per 200ms — same rate as the stream.

---

## ★ PHASE 4 — Feature 6: Layout Persistence

**File**: `src/hooks/useLayoutVisibility.js`

### API
```js
const { visibility, togglePanel, isPanelVisible } = useLayoutVisibility(
  'rpa-layout-v1',                          // localStorage key
  { kpiBar: true, toolbar: true, grid: true } // defaults
);
```

### Panels
| panelId  | What it shows/hides |
|----------|---------------------|
| `kpiBar` | KpiBar component |
| `toolbar`| Toolbar (filters + search) |
| `grid`   | main gridRegion + VirtualGrid |

### Persistence contract
- `useState` initialiser reads from `localStorage` synchronously on mount
- Any toggle immediately calls `localStorage.setItem` with full merged state
- Hard refresh: `useState` initialiser runs again, reads stored JSON, merges with defaults
- Forward compat: new default keys fill gaps in old stored JSON
- Failure safe: try/catch around all localStorage ops — falls back to defaults silently

### UI
- Panel toggle buttons in `appHeader` (right side, before Pause button)
- Active panels: blue-tinted button; hidden panels: muted grey button
- `aria-pressed` attribute reflects current state

---

## ★ PHASE 4 — Feature 9: Multi-Column Concurrent Sorter

**File**: `src/hooks/useMultiSortState.js`  
**Updated**: `src/utils/sortRows.js`

### Sort stack shape
```js
sortStack: [{ key: string, dir: 'asc'|'desc' }, ...]  // index 0 = primary
```
Max 3 keys. Passed to `useViewPool` as `sortConfig` (sortRows.js handles array input).

### Click behaviour
| Action | Result |
|--------|--------|
| Plain click, new key | Reset stack to `[{ key, dir: 'asc' }]` |
| Plain click, same key (asc) | `[{ key, dir: 'desc' }]` |
| Plain click, same key (desc) | `[]` (clear) |
| Shift+click, new key | Append `{ key, dir: 'asc' }` to stack (max 3) |
| Shift+click, existing key (asc) | Update that key to `desc` in place |
| Shift+click, existing key (desc) | Remove that key from stack |

### `getSortMeta(key)` return
```js
{ priority: 1|2|3|null, dir: 'asc'|'desc'|null }
```
Used by `GridHeader` to render `↑1`, `↓2`, `⇅` indicators.

### sortRows.js compatibility
```js
// Backward-compat: single object still works
sortRows(rows, { key: 'budget_usd', dir: 'asc' })
// New multi-sort:
sortRows(rows, [{ key: 'roi_percent', dir: 'asc' }, { key: 'budget_usd', dir: 'desc' }])
// Comparison: iterates stack keys in order; first non-zero diff wins (standard tiebreak)
```

---

## Hook Contracts

### useMultiSortState — Feature 9 (replaces useSortState)
```js
const { sortStack, handleSort, getSortMeta } = useMultiSortState();
// sortStack:   [{ key, dir }, ...]
// handleSort:  (key, shiftHeld) => void   ← called from header onClick with e.shiftKey
// getSortMeta: (key) => { priority: number|null, dir: string|null }
```

### usePauseQueue — Feature 5
```js
const { isPaused, queueLength, togglePause } = usePauseQueue();
// isPaused:    boolean — drives overlay + button state
// queueLength: number  — live count from engine while paused
// togglePause: () => void
```

### useLayoutVisibility — Feature 6
```js
const { visibility, togglePanel, isPanelVisible } = useLayoutVisibility(key, defaults);
// visibility:     Object<panelId, boolean>
// togglePanel:    (panelId) => void
// isPanelVisible: (panelId) => boolean
```

### useFilterState — Feature 7 (unchanged)
### useVirtualGrid — Feature 8 (unchanged)

---

## Utility Functions

### sortRows.js (Phase 4 — upgraded)
```js
sortRows(rows, null)                          // → rows (no sort)
sortRows(rows, { key, dir })                  // → sorted (legacy single-config)
sortRows(rows, [{ key, dir }, { key, dir }])  // → compound sorted (multi-key)
```

### formatters.js (Phase 1 — unchanged)

---

## What Is Done ✅

- [x] Vite + React project scaffolded
- [x] `public/dataStream.js` — corrected telemetry engine
- [x] `public/automation_projects.csv` — 50,000 rows
- [x] `window.rpaStreamControl` — pause/resume/queue engine ready
- [x] **Feature 1** (10 pts): KpiBar — three live KPI counters
- [x] **Feature 2** (10 pts): formatters.js — formatCurrency, formatPercent, isAlertRow
- [x] **Feature 3** (10 pts): Alert flash — CSS keyframe on Failed/negative-ROI rows
- [x] **Feature 4** (10 pts): Single-Column Sorter — superseded by Feature 9 (multi-sort is a strict superset; single-click still works identically)
- [x] **Feature 5** (10 pts): Pause/Play Pipeline Buffer — `usePauseQueue.js`; frozen overlay; queue badge; KPIs catch up on resume
- [x] **Feature 6** (10 pts): Operator Layout Persistence — `useLayoutVisibility.js`; kpiBar/toolbar/grid toggles; hard-refresh safe
- [x] **Feature 7** (10 pts): Categorical Dropdown Filters — composable with sort + search
- [x] **Feature 8** (15 pts): High-Frequency Virtualized DOM Grid — hand-rolled recycling, 60 FPS
- [x] **Feature 9** (10 pts): Multi-Column Concurrent Sorter — `useMultiSortState.js`; shift-click compound sort; priority indicators
- [x] **Feature 10** (5 pts): Multi-Field Fuzzy Search — 150ms debounced, AND logic across 4 fields

## What Is NOT Done Yet ❌

None — all 10 features are functionally complete.

---

## Disqualification Rules (remind every phase)

- Zero server code / SSR — static site only
- Zero virtualization libraries (AG-Grid, TanStack Table, react-window, react-virtualized)
- Codebase must stay modular — no single giant file
- Files target ≤150 lines where reasonably possible

---

## Next Phase: Phase 5 — Polish, Performance Audit, Deployment & Submission Prep

### Goals
1. **Performance audit** — Chrome DevTools profiling: confirm zero long tasks, no heap growth, no React commits on scroll ticks
2. **Visual polish** — scan for rough edges: empty states, header alignment, status badges, mobile/narrow viewport fallback
3. **Accessibility pass** — ARIA roles, keyboard sort, focus management in pause overlay
4. **Deployment** — build (`npm run build`) + deploy to Netlify/Vercel/GitHub Pages; verify live URL
5. **Submission assets** — public GitHub repo, live deployment link, walkthrough video outline
6. **Final PROGRESS.md** — freeze for submission

### Open items to check
- Confirm `VirtualGrid.module.css` `:global(.vRow)` selectors survive Vite CSS Modules build (may need `@layer` or `:global` wrapper depending on PostCSS config)
- Verify `Toolbar.jsx` prop shape still matches what `App.jsx` passes (unchanged in Phase 4 but worth a scan)
- Smoke test: pause for 10s → resume → confirm `kpis.totalRowsProcessed` and `kpis.totalAnnualSavings` include all rows that arrived while paused
