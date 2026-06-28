import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useStreamState } from "./hooks/useStreamState";
import { useMultiSortState } from "./hooks/useMultiSortState";
import { useFilterState } from "./hooks/useFilterState";
import { useViewPool } from "./hooks/useViewPool";
import { usePauseQueue } from "./hooks/usePauseQueue";
import { useLayoutVisibility } from "./hooks/useLayoutVisibility";
import KpiBar from "./components/KpiBar";
import { Toolbar } from "./components/Toolbar";
import VirtualGrid from "./components/VirtualGrid";
import RowInspector from "./components/RowInspector";
import { CommandPalette } from "./components/CommandPalette";
import { ContextMenu } from "./components/ContextMenu";
import { exportToCsv } from "./utils/exportToCsv";
import AnalyticsOverlay from "./components/AnalyticsOverlay";
import "./App.css";

const FILTER_FIELDS = ["automation_type", "department", "industry"];

// Default panel visibility — all visible on first load
const LAYOUT_DEFAULTS = {
  kpiBar: true,
  toolbar: true,
  grid: true,
};

function TerminalBoot({ onComplete }) {
  const [text, setText] = useState("");
  const fullText =
    "INITIALIZING TELEMETRY...\nDECRYPTING MAINFRAME...\nESTABLISHING SECURE CONNECTION...\nCONNECTED.";
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) {
        clearInterval(interval);
        setTimeout(() => onCompleteRef.current(), 500); // brief pause before fade
      }
    }, 15);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bootSequence">
      <div className="bootText">
        {text}
        <span className="bootCursor">█</span>
      </div>
    </div>
  );
}

export default function App() {
  const [isBooting, setIsBooting] = useState(true);

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
  const [searchQuery, setSearchQuery] = useState("");

  // ── Feature 5: Pause / Play ───────────────────────────────────────────────
  const { isPaused, queueLength, togglePause } = usePauseQueue();

  // ── Feature 6: Layout persistence ────────────────────────────────────────
  const { visibility, togglePanel, isPanelVisible } = useLayoutVisibility(
    "rpa-layout-v1",
    LAYOUT_DEFAULTS,
  );

  // ── Analytics Overlay (Bounty Task 2) ──────────────────────────────────────
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  // ── Command Palette ───────────────────────────────────────────────────────
  const [paletteOpen, setPaletteOpen] = useState(false);

  // ── Context Menu ─────────────────────────────────────────────────────────
  const [contextMenu, setContextMenu] = useState(null); // { x, y, rowData }
  const handleContextMenu = useCallback((x, y, rowData) => {
    setContextMenu({ x, y, rowData });
  }, []);

  // ── Row Inspector (Bounty Task 1) ─────────────────────────────────────────
  const [inspectedRow, setInspectedRow] = useState(null);
  // isPaused is available from usePauseQueue — read via ref in the handler
  // so the callback identity stays stable (no deps on isPaused boolean)
  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const handleRowClick = useCallback((rowData) => {
    // Guard: inspector only opens while paused (belt-and-suspenders;
    // the hook already guards, but this keeps App state clean too)
    if (!isPausedRef.current) return;
    setInspectedRow(rowData);
  }, []);

  // ── Global Cmd+K listener ─────────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // ── Filter options (unique values per categorical field) ──────────────────
  const filterOptions = useMemo(() => {
    const opts = {
      automation_type: new Set(),
      department: new Set(),
      industry: new Set(),
    };
    for (const row of rowMap.values()) {
      FILTER_FIELDS.forEach((f) => {
        if (row[f]) opts[f].add(row[f]);
      });
    }
    return {
      automation_type: [...opts.automation_type].sort(),
      department: [...opts.department].sort(),
      industry: [...opts.industry].sort(),
    };
  }, [rowMap]);

  // ── View pipeline — sortStack is the new sortConfig (array) ──────────────
  const { activeViewPool, totalCount, filteredCount } = useViewPool({
    rowMap,
    filters,
    searchQuery,
    sortConfig: sortStack, // sortRows.js now accepts array or single object
  });

  // ── Command palette commands ──────────────────────────────────────────────
  const commands = useMemo(
    () => [
      {
        id: "toggle-stream",
        name: isPaused ? "Resume Stream" : "Pause Stream",
        icon: isPaused ? "▶" : "⏸",
        action: togglePause,
      },
      {
        id: "clear-filters",
        name: "Clear All Filters",
        icon: "✕",
        action: clearAllFilters,
      },
      {
        id: "export-csv",
        name: "Snapshot Export",
        icon: "↓",
        action: () => exportToCsv(activeViewPool),
      },
      {
        id: "toggle-kpi",
        name: `${isPanelVisible("kpiBar") ? "Hide" : "Show"} KPI Bar`,
        icon: "📊",
        action: () => togglePanel("kpiBar"),
      },
      {
        id: "toggle-toolbar",
        name: `${isPanelVisible("toolbar") ? "Hide" : "Show"} Toolbar`,
        icon: "🔧",
        action: () => togglePanel("toolbar"),
      },
      {
        id: "toggle-grid",
        name: `${isPanelVisible("grid") ? "Hide" : "Show"} Grid`,
        icon: "⊞",
        action: () => togglePanel("grid"),
      },
    ],
    [
      isPaused,
      togglePause,
      clearAllFilters,
      activeViewPool,
      isPanelVisible,
      togglePanel,
    ],
  );

  if (isBooting) {
    return <TerminalBoot onComplete={() => setIsBooting(false)} />;
  }

  return (
    <div className="appShell fade-in">
      {/* ── App header ─────────────────────────────────────────────────── */}
      <header className="appHeader glassmorphism">
        <div className="appBrand">
          <div className="appBrandMark">
            <span className="screen"></span>
          </div>
          RPA Monitor
          <span className="appBrandSub">Enterprise Control Terminal</span>
        </div>
        <button
          className="cmdKHint"
          onClick={() => setPaletteOpen(true)}
          title="Open Command Palette"
          aria-label="Open Command Palette"
        >
          <span>⌘K</span>
        </button>

        {/* ── Control cluster: Layout toggles + Pause/Play ─────────────── */}
        <div className="appControls">
          {/* Feature 6: panel visibility toggles */}
          <div className="layoutToggles" title="Show / hide panels">
            <span className="layoutTogglesLabel">Panels</span>
            {[
              { id: "kpiBar", label: "KPIs" },
              { id: "toolbar", label: "Toolbar" },
              { id: "grid", label: "Grid" },
            ].map(({ id, label }) => (
              <button
                key={id}
                className={`layoutBtn ${isPanelVisible(id) ? "layoutBtnActive" : "layoutBtnHidden"}`}
                onClick={() => togglePanel(id)}
                title={`${isPanelVisible(id) ? "Hide" : "Show"} ${label}`}
                aria-pressed={isPanelVisible(id)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Feature 5: Pause/Play */}
          <button
            className={`pauseBtn ${isPaused ? "pauseBtnPaused" : "pauseBtnLive"}`}
            onClick={togglePause}
            title={isPaused ? "Resume stream" : "Pause stream"}
            aria-label={isPaused ? "Resume stream" : "Pause stream"}
          >
            {isPaused ? (
              <>
                <span className="pauseBtnIcon">▶</span>
                <span className="pauseBtnText">Resume</span>
                {queueLength > 0 && (
                  <span className="pauseQueueBadge">
                    {queueLength.toLocaleString()}
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="pauseBtnIcon">⏸</span>
                <span className="pauseBtnText">Pause</span>
              </>
            )}
          </button>

          {/* Bounty Task 2: Analytics View toggle — only active while paused */}
          <button
            id="analytics-view-btn"
            className={`analyticsBtn ${analyticsOpen ? "analyticsBtnOpen" : ""}`}
            onClick={() => setAnalyticsOpen((v) => !v)}
            disabled={!isPaused}
            title={isPaused ? (analyticsOpen ? "Close Analytics View" : "Open Analytics View") : "Pause the stream to use Analytics View"}
            aria-label={analyticsOpen ? "Close Analytics View" : "Open Analytics View"}
            aria-pressed={analyticsOpen}
          >
            <span className="pauseBtnIcon">📈</span>
            <span className="pauseBtnText">Analytics</span>
          </button>

          {/* Snapshot Export */}
          <button
            className="exportGlobalBtn"
            onClick={() => exportToCsv(activeViewPool)}
            title="Download CSV snapshot of current view"
            aria-label="Snapshot Export"
          >
            <span className="pauseBtnIcon">⬇️</span>
            <span className="pauseBtnText">Export</span>
          </button>
        </div>
      </header>

      {/* ── Feature 1: KPI Bar ───────────────────────────────────────────── */}
      {isPanelVisible("kpiBar") && <KpiBar kpis={kpis} />}

      {/* ── Feature 7 + 10: Toolbar (filters + search) ───────────────────── */}
      {isPanelVisible("toolbar") && (
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
          activeViewPool={activeViewPool}
        />
      )}

      {/* ── Feature 8 + 5 + 9: Virtualized grid ─────────────────────────── */}
      {isPanelVisible("grid") && (
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
            onContextMenu={handleContextMenu}
            onRowClick={handleRowClick}
            onResume={togglePause}
          />
        </main>
      )}

      {/* ── Command Palette ────────────────────────────────────────────────── */}
      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        commands={commands}
      />

      {/* ── Context Menu ──────────────────────────────────────────────────── */}
      <ContextMenu
        position={contextMenu ? { x: contextMenu.x, y: contextMenu.y } : null}
        rowData={contextMenu?.rowData}
        onClose={() => setContextMenu(null)}
      />

      {/* ── Row Inspector (Bounty Task 1) ─────────────────────────────────── */}
      <RowInspector row={inspectedRow} onClose={() => setInspectedRow(null)} />

      {/* ── Analytics Overlay (Bounty Task 2) ────────────────────────────────── */}
      <AnalyticsOverlay
        isOpen={analyticsOpen && isPaused}
        onClose={() => setAnalyticsOpen(false)}
        activeViewPool={activeViewPool}
      />
    </div>
  );
}
