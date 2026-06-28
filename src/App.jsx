// src/App.jsx — Phase 4: Pause/Play (F5) + Layout Persistence (F6) + Multi-Sort (F9)
import { useMemo, useState } from 'react';
import { useStreamState } from './hooks/useStreamState';
import { useMultiSortState } from './hooks/useMultiSortState';
import { useFilterState } from './hooks/useFilterState';
import { useViewPool } from './hooks/useViewPool';
import { usePauseQueue } from './hooks/usePauseQueue';
import { useLayoutVisibility } from './hooks/useLayoutVisibility';
import KpiBar from './components/KpiBar';
import { Toolbar } from './components/Toolbar';
import VirtualGrid from './components/VirtualGrid';
import './App.css';

const FILTER_FIELDS = ['automation_type', 'department', 'industry'];

// Default panel visibility — all visible on first load
const LAYOUT_DEFAULTS = {
  kpiBar:  true,
  toolbar: true,
  grid:    true,
};

export default function App() {
  // ── Stream state ──────────────────────────────────────────────────────────
  const { kpis, rowMap } = useStreamState();

  // ── Feature 9: Multi-column sort ──────────────────────────────────────────
  const { sortStack, handleSort, getSortMeta } = useMultiSortState();

  // ── Feature 7: Categorical filters ───────────────────────────────────────
  const {
    filters,
    toggleFilter,
    clearFilter,
    clearAllFilters,
    hasActiveFilters,
  } = useFilterState();

  // ── Feature 10: Search ────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');

  // ── Feature 5: Pause / Play ───────────────────────────────────────────────
  const { isPaused, queueLength, togglePause } = usePauseQueue();

  // ── Feature 6: Layout persistence ────────────────────────────────────────
  const { visibility, togglePanel, isPanelVisible } = useLayoutVisibility(
    'rpa-layout-v1',
    LAYOUT_DEFAULTS,
  );

  // ── Filter options (unique values per categorical field) ──────────────────
  const filterOptions = useMemo(() => {
    const opts = {
      automation_type: new Set(),
      department: new Set(),
      industry: new Set(),
    };
    for (const row of rowMap.values()) {
      FILTER_FIELDS.forEach(f => { if (row[f]) opts[f].add(row[f]); });
    }
    return {
      automation_type: [...opts.automation_type].sort(),
      department:      [...opts.department].sort(),
      industry:        [...opts.industry].sort(),
    };
  }, [rowMap]);

  // ── View pipeline — sortStack is the new sortConfig (array) ──────────────
  const { activeViewPool, totalCount, filteredCount } = useViewPool({
    rowMap,
    filters,
    searchQuery,
    sortConfig: sortStack,   // sortRows.js now accepts array or single object
  });

  return (
    <div className="appShell">
      {/* ── App header ─────────────────────────────────────────────────── */}
      <header className="appHeader">
        <div className="appBrand">
          <span className="appBrandMark">⬡</span>
          RPA Monitor
          <span className="appBrandSub">Enterprise Control Terminal</span>
        </div>

        {/* ── Control cluster: Layout toggles + Pause/Play ─────────────── */}
        <div className="appControls">
          {/* Feature 6: panel visibility toggles */}
          <div className="layoutToggles" title="Show / hide panels">
            <span className="layoutTogglesLabel">Panels</span>
            {[
              { id: 'kpiBar',  label: 'KPIs'    },
              { id: 'toolbar', label: 'Toolbar'  },
              { id: 'grid',    label: 'Grid'     },
            ].map(({ id, label }) => (
              <button
                key={id}
                className={`layoutBtn ${isPanelVisible(id) ? 'layoutBtnActive' : 'layoutBtnHidden'}`}
                onClick={() => togglePanel(id)}
                title={`${isPanelVisible(id) ? 'Hide' : 'Show'} ${label}`}
                aria-pressed={isPanelVisible(id)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Feature 5: Pause/Play */}
          <button
            className={`pauseBtn ${isPaused ? 'pauseBtnPaused' : 'pauseBtnLive'}`}
            onClick={togglePause}
            title={isPaused ? 'Resume stream' : 'Pause stream'}
            aria-label={isPaused ? 'Resume stream' : 'Pause stream'}
          >
            {isPaused ? (
              <>
                <span className="pauseBtnIcon">▶</span>
                <span className="pauseBtnText">Resume</span>
                {queueLength > 0 && (
                  <span className="pauseQueueBadge">{queueLength.toLocaleString()}</span>
                )}
              </>
            ) : (
              <>
                <span className="pauseBtnIcon">⏸</span>
                <span className="pauseBtnText">Pause</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ── Feature 1: KPI Bar ───────────────────────────────────────────── */}
      {isPanelVisible('kpiBar') && <KpiBar kpis={kpis} />}

      {/* ── Feature 7 + 10: Toolbar (filters + search) ───────────────────── */}
      {isPanelVisible('toolbar') && (
        <Toolbar
          filters={filters}
          filterOptions={filterOptions}
          onToggleFilter={toggleFilter}
          onClearFilter={clearFilter}
          onClearAll={clearAllFilters}
          hasActiveFilters={hasActiveFilters}
          onSearch={setSearchQuery}
          filteredCount={filteredCount}
          totalCount={totalCount}
        />
      )}

      {/* ── Feature 8 + 5 + 9: Virtualized grid ─────────────────────────── */}
      {isPanelVisible('grid') && (
        <main className="gridRegion">
          <VirtualGrid
            activeViewPool={activeViewPool}
            totalCount={totalCount}
            filteredCount={filteredCount}
            isPaused={isPaused}
            queueLength={queueLength}
            sortStack={sortStack}
            handleSort={handleSort}
            getSortMeta={getSortMeta}
          />
        </main>
      )}
    </div>
  );
}
