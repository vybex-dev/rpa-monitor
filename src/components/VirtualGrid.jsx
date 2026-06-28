// src/components/VirtualGrid.jsx
// Phase 5 fixes:
//   1. Double-repaint on resume eliminated: second useEffect (isPaused watcher)
//      now only fires repaint when transitioning TO live (false), and is
//      guarded so it doesn't fire on initial mount.
//   2. StatusBar now shows PAUSED indicator when stream is frozen.
//   3. emptyState uses flex flow (not absolute) for correct stacking.

import { useRef, useEffect, useCallback, memo } from 'react';
import { useVirtualGrid, COLUMNS, ROW_HEIGHT } from '../hooks/useVirtualGrid';
import styles from '../styles/VirtualGrid.module.css';

// ── Column header — multi-sort aware ─────────────────────────────────────────
const GridHeader = memo(function GridHeader({ sortStack, handleSort, getSortMeta }) {
  const multiSortActive = sortStack.length > 1;

  return (
    <div className={styles.headerRow} role="row">
      {COLUMNS.map(col => {
        const sortable = ['budget_usd', 'roi_percent', 'employee_hours_saved'].includes(col.key);
        const { priority, dir } = sortable ? getSortMeta(col.key) : { priority: null, dir: null };
        const isSorted = priority !== null;

        return (
          <div
            key={col.key}
            role="columnheader"
            className={[
              styles.headerCell,
              col.align === 'right' ? styles.headerRight : '',
              sortable ? styles.sortable : '',
              isSorted ? styles.sorted : '',
            ].filter(Boolean).join(' ')}
            style={{ flex: `0 0 ${col.width}px`, minWidth: col.width }}
            onClick={sortable ? (e) => handleSort(col.key, e.shiftKey) : undefined}
            title={sortable ? 'Click to sort · Shift+Click to add secondary sort' : undefined}
          >
            <span className={styles.headerLabel}>{col.label}</span>
            {sortable && (
              <span className={styles.sortIndicator}>
                {isSorted
                  ? <>
                      {dir === 'asc' ? ' ↑' : ' ↓'}
                      {multiSortActive && (
                        <span className={styles.sortPriority}>{priority}</span>
                      )}
                    </>
                  : ' ⇅'}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
});

// ── Status bar ────────────────────────────────────────────────────────────────
const StatusBar = memo(function StatusBar({ totalCount, filteredCount, isPaused }) {
  const isFiltered = filteredCount !== totalCount;
  return (
    <div className={styles.statusBar}>
      <span className={styles.statusCount}>
        {filteredCount.toLocaleString()}
        {isFiltered && (
          <span className={styles.statusOf}> of {totalCount.toLocaleString()}</span>
        )}
        <span className={styles.statusLabel}> rows</span>
      </span>
      {isPaused ? (
        <span className={styles.statusPaused}>
          <span className={styles.pausedDot} />
          PAUSED
        </span>
      ) : (
        <span className={styles.statusLive}>
          <span className={styles.liveDot} />
          LIVE
        </span>
      )}
    </div>
  );
});

// ── Frozen overlay — shown when isPaused ──────────────────────────────────────
const FrozenOverlay = memo(function FrozenOverlay({ queueLength, onResume }) {
  return (
    <div className={styles.frozenOverlay} aria-live="polite" aria-label="Stream paused">
      <button
        className={styles.frozenBadge}
        onClick={onResume}
        title="Click to resume stream"
        aria-label="Resume stream"
      >
        <span className={styles.frozenIcon}>⏸</span>
        <span className={styles.frozenLabel}>PAUSED</span>
        {queueLength > 0 && (
          <span className={styles.frozenQueue}>
            {queueLength.toLocaleString()} rows queued
          </span>
        )}
        <span className={styles.frozenInspectHint}>
          🔍 Click rows to inspect · Click here to resume
        </span>
      </button>
    </div>
  );
});

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = memo(function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <span className={styles.emptyIcon}>⊘</span>
      <p className={styles.emptyTitle}>No matching rows</p>
      <p className={styles.emptyHint}>Try clearing a filter or broadening your search.</p>
    </div>
  );
});

// ── VirtualGrid ───────────────────────────────────────────────────────────────
export default function VirtualGrid({
  activeViewPool,
  totalCount,
  filteredCount,
  isPaused,
  queueLength,
  sortStack,
  handleSort,
  getSortMeta,
  onContextMenu,
  onRowClick,
  onResume,
}) {
  const outerRef   = useRef(null);
  const phantomRef = useRef(null);
  const poolRef    = useRef(null);

  const poolNodesRef = useRef([]);
  const getPool = useCallback(() => poolNodesRef.current, []);
  const setPool = useCallback(nodes => { poolNodesRef.current = nodes; }, []);

  const activeViewPoolRef = useRef(activeViewPool);
  useEffect(() => {
    activeViewPoolRef.current = activeViewPool;
  });

  // Track pause state in a ref so the stream-update effect AND the
  // imperative click handler (in useVirtualGrid) can read it without
  // re-subscribing every time isPaused changes.
  const isPausedRef = useRef(isPaused);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

  const { repaint } = useVirtualGrid({
    activeViewPoolRef,
    outerRef,
    phantomRef,
    poolRef,
    getPool,
    setPool,
    onContextMenu,
    onRowClick,
    isPausedRef,
  });

  // Repaint on stream update — skip while paused (grid freezes visually)
  useEffect(() => {
    if (!isPausedRef.current) {
      repaint();
    }
  }, [activeViewPool, repaint]);

  // FIX: single resume repaint — guard with a mounted ref so this doesn't
  // fire on initial mount (isPaused starts false, which would cause a
  // redundant repaint before the pool is even built).
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    // Only repaint when transitioning FROM paused TO live
    if (!isPaused) {
      repaint();
    }
  }, [isPaused, repaint]);

  const totalWidth = COLUMNS.reduce((s, c) => s + c.width, 0);
  const showEmpty  = filteredCount === 0 && !isPaused;

  return (
    <div className={styles.gridShell}>
      <StatusBar
        totalCount={totalCount}
        filteredCount={filteredCount}
        isPaused={isPaused}
      />

      <div className={styles.headerWrap} style={{ minWidth: totalWidth }}>
        <GridHeader
          sortStack={sortStack}
          handleSort={handleSort}
          getSortMeta={getSortMeta}
        />
      </div>

      {/* Grid body — position relative so overlay can cover it */}
      <div className={styles.gridBody} data-paused={isPaused || undefined}>
        <div
          ref={outerRef}
          className={styles.outerScroll}
          role="grid"
          aria-label="RPA project data grid"
        >
          <div style={{ minWidth: totalWidth, position: 'relative' }}>
            <div ref={phantomRef} aria-hidden="true" />
            <div
              ref={poolRef}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%' }}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Frozen overlay — sits over the scroll area only */}
        {isPaused && <FrozenOverlay queueLength={queueLength} onResume={onResume} />}

        {/* Empty state — flex sibling, not absolute, so it doesn't fight the overlay */}
        {showEmpty && <EmptyState />}
      </div>
    </div>
  );
}
