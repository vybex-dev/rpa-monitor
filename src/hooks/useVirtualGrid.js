// src/hooks/useVirtualGrid.js
// Phase 3 — Hand-rolled row recycling engine (Feature 8)
//
// Contract:
//   const gridRef = useVirtualGrid({ activeViewPool, containerRef, ROW_HEIGHT, BUFFER });
//
// - gridRef: attach to the scrollable outer container div
// - containerRef: outer div for ResizeObserver (can be same as gridRef)
// - Returns nothing to React state — all DOM mutations are imperative
// - Zero virtualization libraries. Zero layout thrashing. ~60 FPS.

import { useEffect, useRef, useCallback } from 'react';
import { formatCurrency, formatPercent, isAlertRow } from '../utils/formatters';

export const ROW_HEIGHT = 36;   // px — shared constant, import where needed
export const BUFFER     = 5;    // extra rows above + below visible viewport

// Columns rendered in each recycled row (order = left → right)
const COLUMNS = [
  { key: 'project_id',            label: 'Project ID',     align: 'left',  width: 110, fmt: v => v ?? '—' },
  { key: 'project_name',          label: 'Project',        align: 'left',  width: 220, fmt: v => v ?? '—' },
  { key: 'project_status',        label: 'Status',         align: 'left',  width: 90,  fmt: v => v ?? '—' },
  { key: 'automation_type',       label: 'Type',           align: 'left',  width: 130, fmt: v => v ?? '—' },
  { key: 'department',            label: 'Dept',           align: 'left',  width: 110, fmt: v => v ?? '—' },
  { key: 'budget_usd',            label: 'Budget',         align: 'right', width: 110, fmt: formatCurrency },
  { key: 'annual_savings_usd',    label: 'Ann. Savings',   align: 'right', width: 120, fmt: formatCurrency },
  { key: 'roi_percent',           label: 'ROI %',          align: 'right', width: 90,  fmt: formatPercent  },
  { key: 'robots_deployed',       label: 'Robots',         align: 'right', width: 70,  fmt: v => v ?? '—' },
  { key: 'employee_hours_saved',  label: 'Hrs Saved',      align: 'right', width: 90,  fmt: v => v?.toLocaleString() ?? '—' },
  { key: 'country',               label: 'Country',        align: 'left',  width: 100, fmt: v => v ?? '—' },
  { key: 'industry',              label: 'Industry',       align: 'left',  width: 120, fmt: v => v ?? '—' },
];

export { COLUMNS };

// Status badge colour map — class suffix applied to status cell
const STATUS_CLASS = {
  Active:    'statusActive',
  Completed: 'statusCompleted',
  Failed:    'statusFailed',
  'On Hold': 'statusOnHold',
};

/**
 * Paint one recycled row node with data from `row`.
 * Mutates DOM text/class directly — never triggers React re-render.
 *
 * @param {HTMLElement} rowEl  — the <div role="row"> node
 * @param {Object|null} row    — data row or null (empty / out-of-bounds)
 * @param {number}      absIdx — absolute position in activeViewPool (for stripe)
 * @param {Map}         prevUidMap — Map<nodeIndex, uid> for flash dedup
 * @param {number}      nodeIdx — which pooled node this is
 */
function paintRow(rowEl, row, absIdx, prevUidMap, nodeIdx) {
  if (!rowEl) return;

  // Stripe
  rowEl.classList.toggle('rowEven', absIdx % 2 === 0);
  rowEl.classList.toggle('rowOdd',  absIdx % 2 !== 0);

  if (!row) {
    rowEl.classList.remove('rowAlert', 'flash');
    rowEl.dataset.uid = '';
    const cells = rowEl.children;
    for (let c = 0; c < cells.length; c++) cells[c].textContent = '';
    return;
  }

  const alert = isAlertRow(row);
  rowEl.classList.toggle('rowAlert', alert);

  // Flash: only if this node is now showing a DIFFERENT uid than before
  const prevUid = prevUidMap.get(nodeIdx);
  if (alert && prevUid !== row.internal_uid) {
    // Force reflow trick — same pattern as Phase 1/2
    rowEl.classList.remove('flash');
    void rowEl.offsetWidth;
    rowEl.classList.add('flash');
    rowEl.addEventListener('animationend', () => rowEl.classList.remove('flash'), { once: true });
  }
  prevUidMap.set(nodeIdx, row.internal_uid);
  rowEl.dataset.uid = row.internal_uid;

  // Paint cells
  const cells = rowEl.children;
  for (let c = 0; c < COLUMNS.length; c++) {
    const col  = COLUMNS[c];
    const cell = cells[c];
    if (!cell) continue;

    const raw = row[col.key];
    cell.textContent = col.fmt(raw);

    // Status column gets a class for colour-coded badge
    if (col.key === 'project_status') {
      cell.dataset.status = raw ?? '';
    }
    // ROI negative colour
    if (col.key === 'roi_percent') {
      cell.classList.toggle('cellNegative', typeof raw === 'number' && raw < 0);
    }
  }
}

/**
 * useVirtualGrid
 *
 * @param {Object} opts
 * @param {Array}  opts.activeViewPoolRef  — React ref whose .current = activeViewPool array
 * @param {React.RefObject} opts.outerRef  — attach to the scrollable container div
 * @param {React.RefObject} opts.phantomRef — attach to the phantom spacer div
 * @param {React.RefObject} opts.poolRef   — attach to the row-pool wrapper div
 * @param {function}        opts.getPool   — returns array of row DOM nodes
 * @param {function}        opts.setPool   — called when pool needs rebuild (resize)
 */
export function useVirtualGrid({
  activeViewPoolRef,
  outerRef,
  phantomRef,
  poolRef,
  getPool,
  setPool,
}) {
  const startIndexRef = useRef(0);
  const rafRef        = useRef(null);
  const prevUidMap    = useRef(new Map());   // nodeIdx → uid
  const poolSizeRef   = useRef(0);

  // ── repaint: called on scroll OR stream update, never on both at once ──
  const repaint = useCallback(() => {
    const pool = getPool();
    if (!pool || pool.length === 0) return;

    const viewPool = activeViewPoolRef.current;
    const si       = startIndexRef.current;

    for (let i = 0; i < pool.length; i++) {
      const absIdx = si + i;
      const row    = absIdx < viewPool.length ? viewPool[absIdx] : null;
      paintRow(pool[i], row, absIdx, prevUidMap.current, i);

      // Position via transform — no layout thrash
      pool[i].style.transform = `translateY(${absIdx * ROW_HEIGHT}px)`;
    }

    // Update phantom height
    if (phantomRef.current) {
      phantomRef.current.style.height = `${viewPool.length * ROW_HEIGHT}px`;
    }
  }, [activeViewPoolRef, getPool, phantomRef]);

  // ── scroll handler: rAF-throttled ──
  const onScroll = useCallback(() => {
    if (rafRef.current) return;          // already queued
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const outer = outerRef.current;
      if (!outer) return;

      const scrollTop   = outer.scrollTop;
      const raw         = Math.floor(scrollTop / ROW_HEIGHT) - BUFFER;
      startIndexRef.current = Math.max(0, raw);
      repaint();
    });
  }, [outerRef, repaint]);

  // ── rebuild pool when container size changes ──
  const rebuildPool = useCallback(() => {
    const outer = outerRef.current;
    const pool_container = poolRef.current;
    if (!outer || !pool_container) return;

    const containerH  = outer.clientHeight;
    const visibleRows = Math.ceil(containerH / ROW_HEIGHT);
    const newSize     = visibleRows + BUFFER * 2;

    if (newSize === poolSizeRef.current) {
      repaint();
      return;
    }

    poolSizeRef.current = newSize;
    prevUidMap.current.clear();

    // Remove old children
    while (pool_container.firstChild) pool_container.removeChild(pool_container.firstChild);

    // Create fixed pool of row divs
    const nodes = [];
    for (let i = 0; i < newSize; i++) {
      const rowEl = document.createElement('div');
      rowEl.setAttribute('role', 'row');
      rowEl.className = 'vRow';
      rowEl.style.cssText = `
        position: absolute;
        top: 0; left: 0;
        width: 100%;
        height: ${ROW_HEIGHT}px;
        display: flex;
        align-items: center;
        will-change: transform;
      `;

      // Create cells
      for (let c = 0; c < COLUMNS.length; c++) {
        const col  = COLUMNS[c];
        const cell = document.createElement('div');
        cell.setAttribute('role', 'cell');
        cell.className = `vCell vCell--${col.align}`;
        cell.style.cssText = `
          flex: 0 0 ${col.width}px;
          min-width: ${col.width}px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding: 0 10px;
          font-size: 12px;
          line-height: ${ROW_HEIGHT}px;
        `;
        if (col.align === 'right') cell.style.textAlign = 'right';
        rowEl.appendChild(cell);
      }

      pool_container.appendChild(rowEl);
      nodes.push(rowEl);
    }

    setPool(nodes);
    repaint();
  }, [outerRef, poolRef, repaint, setPool]);

  // ── wire scroll listener + ResizeObserver ──
  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;

    outer.addEventListener('scroll', onScroll, { passive: true });

    const ro = new ResizeObserver(() => rebuildPool());
    ro.observe(outer);

    // Initial build
    rebuildPool();

    return () => {
      outer.removeEventListener('scroll', onScroll);
      ro.disconnect();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [outerRef, onScroll, rebuildPool]);

  // ── expose repaint so VirtualGrid can call it on stream update ──
  return { repaint };
}
