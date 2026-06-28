// src/components/SortableTable.jsx
// Phase 2 display component — TEMPORARY placeholder until Phase 3 virtualized grid.
// Extends Phase 1 AlertRowList with:
//   - Feature 4: clickable sortable column headers (budget_usd, roi_percent, employee_hours_saved)
//   - Receives pre-sorted/filtered `rows` from useViewPool (via App.jsx)
//   - Keeps the Phase 1 CSS flash animation on alert rows (same mechanism)
//
// Props:
//   rows:       Object[] — the activeViewPool from useViewPool (already sorted+filtered+searched)
//   sortConfig: { key, dir } | null — from useSortState
//   onSort:     (key: string) => void — toggleSort from useSortState

import React, { useRef, useEffect } from 'react';
import { formatCurrency, formatPercent, isAlertRow } from '../utils/formatters';
import styles from '../styles/SortableTable.module.css';

// Column definitions — order matters for rendering
const COLUMNS = [
  { key: 'project_name',        label: 'Project',   sortable: false, align: 'left'  },
  { key: 'project_status',      label: 'Status',    sortable: false, align: 'left'  },
  { key: 'roi_percent',         label: 'ROI',       sortable: true,  align: 'right' },
  { key: 'budget_usd',          label: 'Budget',    sortable: true,  align: 'right' },
  { key: 'annual_savings_usd',  label: 'Savings',   sortable: true,  align: 'right' },
  { key: 'employee_hours_saved',label: 'Hrs Saved', sortable: true,  align: 'right' },
  { key: 'robots_deployed',     label: 'Robots',    sortable: false, align: 'right' },
];

// Sort indicator arrows
function SortArrow({ col, sortConfig }) {
  if (!sortConfig || sortConfig.key !== col.key) {
    return <span className={styles.sortArrowIdle}>⇅</span>;
  }
  return (
    <span className={styles.sortArrowActive}>
      {sortConfig.dir === 'asc' ? '↑' : '↓'}
    </span>
  );
}

// ── Table Header ──────────────────────────────────────────────────────────────

function TableHead({ sortConfig, onSort }) {
  return (
    <thead>
      <tr>
        {COLUMNS.map((col) => (
          <th
            key={col.key}
            className={`
              ${styles.th}
              ${col.align === 'right' ? styles.thRight : ''}
              ${col.sortable ? styles.thSortable : ''}
              ${sortConfig?.key === col.key ? styles.thSortActive : ''}
            `}
            onClick={col.sortable ? () => onSort(col.key) : undefined}
            title={col.sortable ? `Sort by ${col.label}` : undefined}
          >
            <span className={styles.thContent}>
              {col.label}
              {col.sortable && <SortArrow col={col} sortConfig={sortConfig} />}
            </span>
          </th>
        ))}
      </tr>
    </thead>
  );
}

// ── Individual Row ────────────────────────────────────────────────────────────
// Memoized so React skips re-rendering rows whose data didn't change.
// Flash animation is identical to Phase 1 AlertRowList mechanism.

const SortableRow = React.memo(function SortableRow({ row }) {
  const trRef = useRef(null);
  const alert = isAlertRow(row);

  useEffect(() => {
    const el = trRef.current;
    if (!el || !alert) return;

    el.classList.remove(styles.flash);
    void el.offsetWidth; // force reflow on THIS element only
    el.classList.add(styles.flash);

    function onEnd() { el.classList.remove(styles.flash); }
    el.addEventListener('animationend', onEnd, { once: true });
    return () => el.removeEventListener('animationend', onEnd);
  }, [row, alert]);

  const statusClass = {
    Active:     styles.statusActive,
    Completed:  styles.statusCompleted,
    Failed:     styles.statusFailed,
    'On Hold':  styles.statusHold,
  }[row.project_status] || '';

  return (
    <tr ref={trRef} className={styles.row}>
      <td className={styles.tdName} title={row.project_name}>
        {row.project_name}
      </td>
      <td>
        <span className={`${styles.badge} ${statusClass}`}>
          {row.project_status}
        </span>
      </td>
      <td className={`${styles.tdNum} ${row.roi_percent < 0 ? styles.negative : ''}`}>
        {formatPercent(row.roi_percent)}
      </td>
      <td className={styles.tdNum}>{formatCurrency(row.budget_usd)}</td>
      <td className={styles.tdNum}>{formatCurrency(row.annual_savings_usd)}</td>
      <td className={styles.tdNum}>{row.employee_hours_saved?.toLocaleString() ?? '—'}</td>
      <td className={styles.tdNum}>{row.robots_deployed}</td>
    </tr>
  );
});

// ── SortableTable ─────────────────────────────────────────────────────────────

function SortableTable({ rows, sortConfig, onSort }) {
  const displayRows = rows.slice(0, 200); // cap DOM nodes until Phase 3 virtualization

  return (
    <section className={styles.section}>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <TableHead sortConfig={sortConfig} onSort={onSort} />
          <tbody>
            {displayRows.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className={styles.emptyCell}>
                  No rows match current filters or search query.
                </td>
              </tr>
            ) : (
              displayRows.map((row) => (
                <SortableRow key={row.internal_uid} row={row} />
              ))
            )}
          </tbody>
        </table>
      </div>
      {rows.length > 200 && (
        <div className={styles.virtualNote}>
          Showing top 200 of {rows.length.toLocaleString()} rows — full virtualized grid in Phase 3
        </div>
      )}
    </section>
  );
}

export default React.memo(SortableTable);
