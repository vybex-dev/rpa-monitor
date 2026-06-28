<div align="center">

<<<<<<< HEAD
# 🖥️ RPA Monitor

### Enterprise Control Terminal

**A zero-dependency, 100% client-side real-time telemetry dashboard built for Frontend Battle 2026 — Round 2.**  
Streams, filters, sorts, and virtualizes 50,000 live RPA project rows at 60 FPS. No backend. No virtualization libraries. Just React.

<br />

[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-22d3ee?style=for-the-badge)](LICENSE)

</div>

---

=======
# ⬡ RPA Monitor
### Enterprise Control Terminal

**A zero-dependency, 100% client-side real-time telemetry dashboard built for Frontend Battle 2026 — Round 2.**  
Streams, filters, sorts, and virtualizes 50,000 live RPA project rows at 60 FPS. No backend. No virtualization libraries. Just React.

<br />

[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-22d3ee?style=for-the-badge)](LICENSE)

</div>

---

>>>>>>> 17d08f6 (v1.2)
## 📖 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Data Pipeline](#-data-pipeline)
- [Component Reference](#-component-reference)
- [Hook Reference](#-hook-reference)
- [Utility Reference](#-utility-reference)
- [Getting Started](#-getting-started)
- [Build & Deployment](#-build--deployment)
- [Performance Design](#-performance-design)
- [Hackathon Compliance](#-hackathon-compliance)

---

## 🌐 Overview

**RPA Monitor** is an enterprise-grade, real-time telemetry dashboard that ingests a live stream of RPA (Robotic Process Automation) project data and renders it at 60 FPS — without ever touching a server.

The app boots with a cinematic terminal animation, then displays a continuously-updating grid of **50,000 project rows**, powered by a custom virtualization engine hand-rolled in imperative DOM. A 200ms telemetry firehose from `dataStream.js` drives all KPI counters, the data grid, and sparkline graphs simultaneously — with zero dropped frames.

<<<<<<< HEAD
> **Hackathon theme:** _"The Best Dashboard Under the Sun"_  
=======
> **Hackathon theme:** *"The Best Dashboard Under the Sun"*  
>>>>>>> 17d08f6 (v1.2)
> **Constraint:** 100% static site — zero server, zero SSR, zero virtualization libraries.

---

## 🚀 Live Demo

<<<<<<< HEAD
> 🔗 **[rpa-monitor.netlify.app](#)** _(deploy link — update before submission)_
=======
> 🔗 **[rpa-monitor.netlify.app](#)** *(deploy link — update before submission)*
>>>>>>> 17d08f6 (v1.2)

---

## ✨ Features

All **10 features** are implemented and functionally complete, totalling **100 points**.

<<<<<<< HEAD
| #       | Feature                             | Points | Implementation                                                                                                                                                                                                                    |
| ------- | ----------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **F1**  | **Live KPI Counters**               | 10     | Three real-time metrics (Rows Processed, Robots Deployed, Cumulative Savings) with canvas sparklines. `KpiBar.jsx` + `useStreamState.js`                                                                                          |
| **F2**  | **Value Formatters**                | 10     | `formatCurrency`, `formatPercent`, `isAlertRow` — applied across the grid and KPI bar. `formatters.js`                                                                                                                            |
| **F3**  | **Alert Flash**                     | 10     | CSS keyframe animation triggers on rows where `project_status === 'Failed'` or `roi_percent < 0`. Only flashes when a new unique row enters the viewport node.                                                                    |
| **F4**  | **Single-Column Sort**              | 10     | Superseded by Feature 9 (multi-sort is a strict superset; single plain-click still works identically). `useMultiSortState.js`                                                                                                     |
| **F5**  | **Pause / Play Pipeline Buffer**    | 10     | Freeze the live stream; rows queue in the engine's closure. Resume triggers a single atomic flush — KPIs and grid catch up in one paint. `usePauseQueue.js`                                                                       |
| **F6**  | **Operator Layout Persistence**     | 10     | Toggle KPI Bar, Toolbar, or Grid panel visibility. State persists across hard refresh via `localStorage`. `useLayoutVisibility.js`                                                                                                |
| **F7**  | **Categorical Dropdown Filters**    | 10     | Multi-select checkboxes for `Automation Type`, `Department`, `Industry`. Composable with sort + fuzzy search. `useFilterState.js` + `Toolbar.jsx`                                                                                 |
| **F8**  | **High-Frequency Virtualized Grid** | 15     | Hand-rolled row recycling engine. Fixed DOM pool, `transform: translateY` positioning, `ResizeObserver` for dynamic pool sizing, rAF-throttled scroll. **Zero virtualization libraries.** `useVirtualGrid.js` + `VirtualGrid.jsx` |
| **F9**  | **Multi-Column Concurrent Sorter**  | 10     | Stack up to 3 sort keys. `Shift+Click` a header to append a secondary/tertiary key. Priority badges (up-1, down-2) render inline. `useMultiSortState.js`                                                                          |
| **F10** | **Multi-Field Fuzzy Search**        | 5      | 150ms debounced search across `project_name`, `company_id`, `implementation_partner`, `country`. AND logic. Pre-computed `_searchStr` on ingest. `searchRows.js`                                                                  |
=======
| # | Feature | Points | Implementation |
|---|---------|--------|----------------|
| **F1** | **Live KPI Counters** | 10 | Three real-time metrics (Rows Processed, Robots Deployed, Cumulative Savings) with canvas sparklines. `KpiBar.jsx` + `useStreamState.js` |
| **F2** | **Value Formatters** | 10 | `formatCurrency`, `formatPercent`, `isAlertRow` — applied across the grid and KPI bar. `formatters.js` |
| **F3** | **Alert Flash** | 10 | CSS keyframe animation triggers on rows where `project_status === 'Failed'` or `roi_percent < 0`. Only flashes when a new unique row enters the viewport node. |
| **F4** | **Single-Column Sort** | 10 | Superseded by Feature 9 (multi-sort is a strict superset; single plain-click still works identically). `useMultiSortState.js` |
| **F5** | **Pause / Play Pipeline Buffer** | 10 | Freeze the live stream; rows queue in the engine's closure. Resume triggers a single atomic flush — KPIs and grid catch up in one paint. `usePauseQueue.js` |
| **F6** | **Operator Layout Persistence** | 10 | Toggle KPI Bar, Toolbar, or Grid panel visibility. State persists across hard refresh via `localStorage`. `useLayoutVisibility.js` |
| **F7** | **Categorical Dropdown Filters** | 10 | Multi-select checkboxes for `Automation Type`, `Department`, `Industry`. Composable with sort + fuzzy search. `useFilterState.js` + `Toolbar.jsx` |
| **F8** | **High-Frequency Virtualized Grid** | 15 | Hand-rolled row recycling engine. Fixed DOM pool, `transform: translateY` positioning, `ResizeObserver` for dynamic pool sizing, rAF-throttled scroll. **Zero virtualization libraries.** `useVirtualGrid.js` + `VirtualGrid.jsx` |
| **F9** | **Multi-Column Concurrent Sorter** | 10 | Stack up to 3 sort keys. `Shift+Click` a header to append a secondary/tertiary key. Priority badges (up-1, down-2) render inline. `useMultiSortState.js` |
| **F10** | **Multi-Field Fuzzy Search** | 5 | 150ms debounced search across `project_name`, `company_id`, `implementation_partner`, `country`. AND logic. Pre-computed `_searchStr` on ingest. `searchRows.js` |
>>>>>>> 17d08f6 (v1.2)

---

## Architecture

```
+------------------------------------------------------------------+
|                        dataStream.js                            |
|   CSV -> 50K-row memory pool -> 200ms setInterval firehose      |
|   window.initializeRpaStream(callback)                          |
|   window.rpaStreamControl { pause(), resume(), queueLength }    |
+-------------------------+----------------------------------------+
                          | batch (5-50 rows / tick)
                          v
+------------------------------------------------------------------+
|                     useStreamState.js                           |
|   useReducer -- Map<uid, row> upsert  O(batch_size)             |
|   KPI deltas maintained incrementally -- never O(total_rows)    |
|   Pre-computes _searchStr on every ingest row                   |
|   Emits: { kpis, rowMap }                                       |
+--------+--------------------------------------------+-----------+
         | kpis                                       | rowMap
         v                                            v
+----------------+               +----------------------------------+
|   KpiBar.jsx   |               |           useViewPool.js         |
|  Canvas spark- |               |  rowMap -> materialize           |
|  lines + live  |               |        -> filterRows (F7)        |
|  counters (F1) |               |        -> searchRows (F10)       |
+----------------+               |        -> sortRows (F4/F9)       |
                                 |  Emits: activeViewPool           |
                                 +----------------+-----------------+
                                                  |
                                                  v
                                 +----------------------------------+
                                 |         VirtualGrid.jsx          |
                                 |   Fixed DOM pool (recycled rows) |
                                 |   rAF-throttled scroll handler   |
                                 |   ResizeObserver pool rebuilder  |
                                 |   Frozen overlay when paused     |
                                 |   Multi-sort header badges       |
                                 +----------------------------------+
```

### Key Design Principles

- **O(batch_size) renders** — KPI sums are incremental deltas, never re-summed from the full 50K-row Map.
- **Imperative DOM for the grid** — `paintRow()` writes `textContent` and CSS classes directly. React never touches the row pool.
- **Single-render resume** — `ctrl.resume()` fires the queued batch synchronously; React batches the `dispatch` + `setIsPaused(false)` into one commit.
- **Pre-computed search strings** — `_searchStr` is computed once on ingest, not on every filter cycle.
- **No `index.js` barrel files** — every import references the exact file path.

---

## Project Structure

```
rpa-monitor/
├── public/
│   ├── dataStream.js              <- Official hackathon telemetry engine
│   └── automation_projects.csv   <- 50,000-row RPA project dataset
│
├── src/
│   ├── components/
│   │   ├── KpiBar.jsx             <- F1: Live KPI counters + canvas sparklines
│   │   ├── AlertRowList.jsx       <- F3: Alert row placeholder (Phase 1)
│   │   ├── SortableTable.jsx      <- Phase 2 table (superseded by VirtualGrid)
│   │   ├── Toolbar.jsx            <- F7 + F10: Filters + debounced search
│   │   ├── VirtualGrid.jsx        <- F5 + F8 + F9: Virtualized grid
│   │   ├── CommandPalette.jsx     <- Cmd+K command palette (portal)
│   │   └── ContextMenu.jsx        <- Right-click row context menu
│   │
│   ├── hooks/
│   │   ├── useStreamState.js      <- Central stream reducer + KPI engine
│   │   ├── useViewPool.js         <- Filter -> search -> sort pipeline
│   │   ├── useVirtualGrid.js      <- F8: Hand-rolled row recycling engine
│   │   ├── useMultiSortState.js   <- F9: Compound sort stack (max 3 keys)
│   │   ├── useFilterState.js      <- F7: Set-based multi-select filter state
│   │   ├── usePauseQueue.js       <- F5: Pause/resume + queue badge ticker
│   │   ├── useLayoutVisibility.js <- F6: Panel visibility + localStorage
│   │   └── useSortState.js        <- Phase 2 (superseded by useMultiSortState)
│   │
│   ├── utils/
│   │   ├── formatters.js          <- formatCurrency, formatPercent, isAlertRow
│   │   ├── sortRows.js            <- Multi-key stable sort (array or single)
│   │   ├── filterRows.js          <- Set-based categorical filter
│   │   ├── searchRows.js          <- AND fuzzy search on _searchStr
│   │   └── exportToCsv.js         <- CSV export of current filtered view
│   │
│   ├── styles/                    <- CSS Modules (one per component)
│   ├── App.jsx                    <- Root: wires all features together
│   ├── App.css                    <- Global app shell styles + glassmorphism
│   ├── main.jsx                   <- React entry (StrictMode removed)
│   └── index.css                  <- Reset / empty
│
├── index.html                     <- Vite HTML entry + dataStream.js script tag
├── vite.config.js
├── package.json
└── PROGRESS.md                    <- Phase-by-phase build journal
```

---

## Data Pipeline

### `dataStream.js` — Telemetry Engine

The hackathon-provided engine is loaded as a plain `<script>` in `index.html` and exposes two globals:

```js
// Initialize the stream with a callback
<<<<<<< HEAD
window.initializeRpaStream(callback, csvUrl);

// Control object — available after initialization
window.rpaStreamControl;
=======
window.initializeRpaStream(callback, csvUrl)

// Control object — available after initialization
window.rpaStreamControl
>>>>>>> 17d08f6 (v1.2)
//  .pause()       sets internal isPaused = true; rows queue in closure
//  .resume()      flushes pendingQueue synchronously via callback, then clears
//  .isPaused      boolean getter
//  .queueLength   live count of queued rows while paused
```

**Tick rate:** Every 200ms, the engine randomly selects 5–50 rows from the in-memory pool, mutates their metrics (revenue, employee count, market share), and fires `callback(batch)`.

### CSV Schema

The dataset (`automation_projects.csv`, 50,000 rows) contains:

<<<<<<< HEAD
| Column                   | Type   | Description                                |
| ------------------------ | ------ | ------------------------------------------ |
| `project_id`             | string | Unique project identifier                  |
| `project_name`           | string | Human-readable project name                |
| `project_status`         | string | `Active`, `Completed`, `Failed`, `On Hold` |
| `automation_type`        | string | Filter dimension                           |
| `department`             | string | Filter dimension                           |
| `budget_usd`             | number | Sortable — formatted as currency           |
| `annual_savings_usd`     | number | KPI accumulator + sortable                 |
| `roi_percent`            | number | Sortable — negative triggers alert         |
| `robots_deployed`        | number | KPI accumulator                            |
| `employee_hours_saved`   | number | Sortable                                   |
| `country`                | string | Searchable                                 |
| `industry`               | string | Filter dimension                           |
| `implementation_partner` | string | Searchable                                 |
=======
| Column | Type | Description |
|--------|------|-------------|
| `project_id` | string | Unique project identifier |
| `project_name` | string | Human-readable project name |
| `project_status` | string | `Active`, `Completed`, `Failed`, `On Hold` |
| `automation_type` | string | Filter dimension |
| `department` | string | Filter dimension |
| `budget_usd` | number | Sortable — formatted as currency |
| `annual_savings_usd` | number | KPI accumulator + sortable |
| `roi_percent` | number | Sortable — negative triggers alert |
| `robots_deployed` | number | KPI accumulator |
| `employee_hours_saved` | number | Sortable |
| `country` | string | Searchable |
| `industry` | string | Filter dimension |
| `implementation_partner` | string | Searchable |
>>>>>>> 17d08f6 (v1.2)

---

## Component Reference

### `KpiBar.jsx`
<<<<<<< HEAD

Three live KPI cards with real-time canvas sparklines. Each card tracks a rolling 30-tick history and draws a gradient area chart using the 2D Canvas API. Uses `React.memo` to skip re-renders for unrelated parent updates. `font-variant-numeric: tabular-nums` prevents layout shift under rapid digit changes.

### `VirtualGrid.jsx`

The centrepiece. Composes:

=======
Three live KPI cards with real-time canvas sparklines. Each card tracks a rolling 30-tick history and draws a gradient area chart using the 2D Canvas API. Uses `React.memo` to skip re-renders for unrelated parent updates. `font-variant-numeric: tabular-nums` prevents layout shift under rapid digit changes.

### `VirtualGrid.jsx`
The centrepiece. Composes:
>>>>>>> 17d08f6 (v1.2)
- **`GridHeader`** — multi-sort aware column headers. Click = single sort. `Shift+Click` = append to stack. Priority badges appear in multi-sort mode.
- **`StatusBar`** — row count + LIVE / PAUSED indicator with pulsing dot.
- **`FrozenOverlay`** — semi-transparent overlay with queue badge shown while paused.
- **`EmptyState`** — shown when all rows are filtered out.

### `Toolbar.jsx`
<<<<<<< HEAD

Search input (150ms debounced, uncontrolled at DOM level) + three custom multi-select dropdowns (`Type`, `Dept`, `Industry`). Closes on outside click via `mousedown` listener. Shows active-filter count badge on each button. Includes an **Export CSV** button for the current filtered view.

### `CommandPalette.jsx`

Triggered by `Cmd+K` / `Ctrl+K`. Rendered via `createPortal` into `document.body`. Supports keyboard navigation (arrow keys, Enter, Escape) and fuzzy command search. Available commands: Pause/Resume, Clear Filters, Export CSV, Toggle KPI/Toolbar/Grid panels.

### `ContextMenu.jsx`

=======
Search input (150ms debounced, uncontrolled at DOM level) + three custom multi-select dropdowns (`Type`, `Dept`, `Industry`). Closes on outside click via `mousedown` listener. Shows active-filter count badge on each button. Includes an **Export CSV** button for the current filtered view.

### `CommandPalette.jsx`
Triggered by `Cmd+K` / `Ctrl+K`. Rendered via `createPortal` into `document.body`. Supports keyboard navigation (arrow keys, Enter, Escape) and fuzzy command search. Available commands: Pause/Resume, Clear Filters, Export CSV, Toggle KPI/Toolbar/Grid panels.

### `ContextMenu.jsx`
>>>>>>> 17d08f6 (v1.2)
Right-click any grid row to open a positioned context menu with row-level actions. The `onContextMenu` callback passes `(clientX, clientY, rowData)` from the imperative DOM layer up through `VirtualGrid` to `App`.

---

## Hook Reference

### `useStreamState()`
<<<<<<< HEAD

```js
const { kpis, rowMap } = useStreamState();
```

Central stream reducer. Uses `useReducer` with a single `dispatch` per 200ms batch. Large resume flushes (>2,500 rows) are chunked via `requestAnimationFrame` to prevent main-thread blocking.

### `useViewPool({ rowMap, filters, searchQuery, sortConfig })`

```js
const { activeViewPool, totalCount, filteredCount } = useViewPool(...);
```

The data pipeline: `materialize -> filterRows -> searchRows -> sortRows`. `sortConfig` accepts either a single `{ key, dir }` object or an array `[{ key, dir }, ...]`.

### `useVirtualGrid({ ... })`

```js
const { repaint } = useVirtualGrid({ activeViewPoolRef, outerRef, phantomRef, poolRef, ... });
```

Hand-rolled recycling engine. Maintains a fixed pool of DOM row nodes positioned via `transform: translateY`. `ResizeObserver` rebuilds the pool on container resize. rAF-throttled scroll handler. Zero layout thrashing.

### `useMultiSortState()`

```js
const { sortStack, handleSort, getSortMeta } = useMultiSortState();
```

| Gesture                       | Result                   |
| ----------------------------- | ------------------------ |
| Click new column              | `[{ key, dir: 'asc' }]`  |
| Click same column (asc)       | `[{ key, dir: 'desc' }]` |
| Click same column (desc)      | `[]` (clear)             |
| `Shift+Click` new column      | Append (max 3)           |
| `Shift+Click` existing (asc)  | Toggle to `desc`         |
| `Shift+Click` existing (desc) | Remove from stack        |

### `usePauseQueue()`

```js
const { isPaused, queueLength, togglePause } = usePauseQueue();
```

Bridges the engine's closure-based queue to React state. A 200ms `setInterval` polls `window.rpaStreamControl.queueLength` while paused to update the badge — the only React re-render during pause.

### `useLayoutVisibility(storageKey, defaults)`

```js
const { visibility, togglePanel, isPanelVisible } = useLayoutVisibility(
  "rpa-layout-v1",
  defaults,
);
```

Persists panel visibility to `localStorage`. `try/catch` around all storage ops — falls back to defaults silently. Forward-compatible: new default keys fill gaps in old stored JSON.

### `useFilterState()`

```js
const {
  filters,
  toggleFilter,
  clearFilter,
  clearAllFilters,
  hasActiveFilters,
} = useFilterState();
```

=======
```js
const { kpis, rowMap } = useStreamState();
```
Central stream reducer. Uses `useReducer` with a single `dispatch` per 200ms batch. Large resume flushes (>2,500 rows) are chunked via `requestAnimationFrame` to prevent main-thread blocking.

### `useViewPool({ rowMap, filters, searchQuery, sortConfig })`
```js
const { activeViewPool, totalCount, filteredCount } = useViewPool(...);
```
The data pipeline: `materialize -> filterRows -> searchRows -> sortRows`. `sortConfig` accepts either a single `{ key, dir }` object or an array `[{ key, dir }, ...]`.

### `useVirtualGrid({ ... })`
```js
const { repaint } = useVirtualGrid({ activeViewPoolRef, outerRef, phantomRef, poolRef, ... });
```
Hand-rolled recycling engine. Maintains a fixed pool of DOM row nodes positioned via `transform: translateY`. `ResizeObserver` rebuilds the pool on container resize. rAF-throttled scroll handler. Zero layout thrashing.

### `useMultiSortState()`
```js
const { sortStack, handleSort, getSortMeta } = useMultiSortState();
```
| Gesture | Result |
|---------|--------|
| Click new column | `[{ key, dir: 'asc' }]` |
| Click same column (asc) | `[{ key, dir: 'desc' }]` |
| Click same column (desc) | `[]` (clear) |
| `Shift+Click` new column | Append (max 3) |
| `Shift+Click` existing (asc) | Toggle to `desc` |
| `Shift+Click` existing (desc) | Remove from stack |

### `usePauseQueue()`
```js
const { isPaused, queueLength, togglePause } = usePauseQueue();
```
Bridges the engine's closure-based queue to React state. A 200ms `setInterval` polls `window.rpaStreamControl.queueLength` while paused to update the badge — the only React re-render during pause.

### `useLayoutVisibility(storageKey, defaults)`
```js
const { visibility, togglePanel, isPanelVisible } = useLayoutVisibility('rpa-layout-v1', defaults);
```
Persists panel visibility to `localStorage`. `try/catch` around all storage ops — falls back to defaults silently. Forward-compatible: new default keys fill gaps in old stored JSON.

### `useFilterState()`
```js
const { filters, toggleFilter, clearFilter, clearAllFilters, hasActiveFilters } = useFilterState();
```
>>>>>>> 17d08f6 (v1.2)
Each filter field holds a `Set<string>`. `filterRows.js` checks `row[field] ∈ activeSet` for each active field — composable AND logic.

---

## Utility Reference

### `sortRows.js`
<<<<<<< HEAD

```js
sortRows(rows, null); // rows unchanged
sortRows(rows, { key: "budget_usd", dir: "asc" }); // single sort
sortRows(rows, [
  { key: "roi_percent", dir: "asc" },
  { key: "budget_usd", dir: "desc" },
]); // multi-key
```

Stable comparison: iterates the sort stack in order; first non-zero diff wins (standard tiebreak).

### `formatters.js`

```js
formatCurrency(1234567.89); // -> "$1.23M"
formatPercent(0.1234); // -> "12.34%"
isAlertRow(row); // -> true if status === 'Failed' || roi_percent < 0
```

### `filterRows.js` / `searchRows.js` / `exportToCsv.js`

=======
```js
sortRows(rows, null)                                                       // rows unchanged
sortRows(rows, { key: 'budget_usd', dir: 'asc' })                         // single sort
sortRows(rows, [{ key: 'roi_percent', dir: 'asc' }, { key: 'budget_usd', dir: 'desc' }]) // multi-key
```
Stable comparison: iterates the sort stack in order; first non-zero diff wins (standard tiebreak).

### `formatters.js`
```js
formatCurrency(1234567.89)  // -> "$1.23M"
formatPercent(0.1234)       // -> "12.34%"
isAlertRow(row)             // -> true if status === 'Failed' || roi_percent < 0
```

### `filterRows.js` / `searchRows.js` / `exportToCsv.js`
>>>>>>> 17d08f6 (v1.2)
Pure functions with no side effects. `searchRows` operates on the pre-computed `_searchStr` field for O(1) string access per row. `exportToCsv` generates a `Blob` download of the current `activeViewPool`.

---

## Getting Started

### Prerequisites

- **Node.js** v22.x
- **npm** v10.x

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/rpa-monitor.git
cd rpa-monitor

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. The terminal boot animation runs once, then the live stream begins.

> **Note:** The app expects `automation_projects.csv` to be in the `public/` folder (already included). Do not move or rename it.

### Available Scripts

<<<<<<< HEAD
| Command           | Description                                  |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Start Vite dev server with HMR               |
| `npm run build`   | Build optimised production bundle to `dist/` |
| `npm run preview` | Preview the production build locally         |
| `npm run lint`    | Run Oxlint static analysis                   |
=======
| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build optimised production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Oxlint static analysis |
>>>>>>> 17d08f6 (v1.2)

---

## Build & Deployment

```bash
# Build for production
npm run build

# The dist/ folder is fully self-contained — deploy anywhere:
# Netlify, Vercel, GitHub Pages, S3, Cloudflare Pages, etc.
```

The output is a **100% static site** — no server required. Copy the `dist/` folder to any web host.

---

## Performance Design

<<<<<<< HEAD
| Concern            | Solution                                                                 |
| ------------------ | ------------------------------------------------------------------------ |
| 50K-row re-renders | `useReducer` with incremental KPI deltas — O(batch_size) per tick        |
| Grid DOM mutations | Imperative `textContent` + class writes — React never touches row nodes  |
| Scroll jank        | `requestAnimationFrame`-throttled scroll handler — one repaint per frame |
| Fuzzy search cost  | `_searchStr` pre-computed on ingest, not on query                        |
| Resume flush lag   | Large batches chunked at 2,500 rows via rAF — main thread stays alive    |
| CSS layout shift   | `font-variant-numeric: tabular-nums` on all KPI values                   |
| Grid pool size     | `ResizeObserver` dynamically adjusts pool size on viewport resize        |
| Memory             | `Map<uid, row>` with copy-on-write — safe for `useMemo` dependency       |
=======
| Concern | Solution |
|---------|----------|
| 50K-row re-renders | `useReducer` with incremental KPI deltas — O(batch_size) per tick |
| Grid DOM mutations | Imperative `textContent` + class writes — React never touches row nodes |
| Scroll jank | `requestAnimationFrame`-throttled scroll handler — one repaint per frame |
| Fuzzy search cost | `_searchStr` pre-computed on ingest, not on query |
| Resume flush lag | Large batches chunked at 2,500 rows via rAF — main thread stays alive |
| CSS layout shift | `font-variant-numeric: tabular-nums` on all KPI values |
| Grid pool size | `ResizeObserver` dynamically adjusts pool size on viewport resize |
| Memory | `Map<uid, row>` with copy-on-write — safe for `useMemo` dependency |
>>>>>>> 17d08f6 (v1.2)

---

## Hackathon Compliance

<<<<<<< HEAD
| Rule                                                                             | Status                                   |
| -------------------------------------------------------------------------------- | ---------------------------------------- |
| Zero server / SSR code                                                           | ✅ 100% client-side static site          |
| No virtualization libraries (AG-Grid, TanStack, react-window, react-virtualized) | ✅ Hand-rolled recycling engine only     |
| Modular codebase — no single giant file                                          | ✅ Every file targets ≤150 lines         |
| Uses official `dataStream.js` telemetry engine unmodified                        | ✅ Loaded via `<script>` in `index.html` |
| Uses official `automation_projects.csv` dataset                                  | ✅ 50,000 rows in `public/`              |
=======
| Rule | Status |
|------|--------|
| Zero server / SSR code | ✅ 100% client-side static site |
| No virtualization libraries (AG-Grid, TanStack, react-window, react-virtualized) | ✅ Hand-rolled recycling engine only |
| Modular codebase — no single giant file | ✅ Every file targets ≤150 lines |
| Uses official `dataStream.js` telemetry engine unmodified | ✅ Loaded via `<script>` in `index.html` |
| Uses official `automation_projects.csv` dataset | ✅ 50,000 rows in `public/` |
>>>>>>> 17d08f6 (v1.2)

---

## Build Phases

<<<<<<< HEAD
| Phase       | Scope                                                                                                      |
| ----------- | ---------------------------------------------------------------------------------------------------------- |
| **Phase 1** | Project scaffold, `dataStream.js` integration, KpiBar (F1), formatters (F2), alert flash (F3)              |
| **Phase 2** | `SortableTable` (F4), `Toolbar` with filters (F7) and search (F10)                                         |
| **Phase 3** | `VirtualGrid` + `useVirtualGrid` hand-rolled recycling engine (F8)                                         |
| **Phase 4** | Pause/Play pipeline buffer (F5), layout persistence (F6), multi-sort (F9), `CommandPalette`, `ContextMenu` |
| **Phase 5** | Performance audit, accessibility pass, visual polish, boot animation, deployment                           |
=======
| Phase | Scope |
|-------|-------|
| **Phase 1** | Project scaffold, `dataStream.js` integration, KpiBar (F1), formatters (F2), alert flash (F3) |
| **Phase 2** | `SortableTable` (F4), `Toolbar` with filters (F7) and search (F10) |
| **Phase 3** | `VirtualGrid` + `useVirtualGrid` hand-rolled recycling engine (F8) |
| **Phase 4** | Pause/Play pipeline buffer (F5), layout persistence (F6), multi-sort (F9), `CommandPalette`, `ContextMenu` |
| **Phase 5** | Performance audit, accessibility pass, visual polish, boot animation, deployment |
>>>>>>> 17d08f6 (v1.2)

---

## License

MIT © 2026 — Built for Frontend Battle 2026 · Round 2

---

<div align="center">

**Made with React 19 + Vite 8 · Zero dependencies beyond the React ecosystem**

<<<<<<< HEAD
_"If it scrolls smoothly at 50,000 rows, you've won."_
=======
*"If it scrolls smoothly at 50,000 rows, you've won."*
>>>>>>> 17d08f6 (v1.2)

</div>
