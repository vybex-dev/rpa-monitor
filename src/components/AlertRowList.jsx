// src/components/AlertRowList.jsx
// TEMPORARY — replaced by virtualized grid in Phase 3.
// Feature 3: Visual System Alert & Status Indicators
//
// Flash mechanism: when a row arrives as alert-worthy (Failed status or
// negative roi), we add the CSS class `flash` to that row's element.
// The class triggers a @keyframes animation defined in AlertRowList.module.css.
// We remove the class on the `animationend` event — no JS setTimeout,
// no style mutations, no forced reflow on the entire list.
//
// Why this avoids list-wide reflow:
//   - Only the individual <tr> element gets a class toggle.
//   - CSS animations run on the compositor thread for background-color
//     changes that don't affect layout geometry.
//   - animationend removes the class; React state is NOT updated on
//     animationend (that would re-render the whole list). The DOM class
//     is mutated directly on the element ref via the event handler.

import React, { useRef, useEffect } from 'react';
import { formatCurrency, formatPercent, isAlertRow } from '../utils/formatters';
import styles from '../styles/AlertRowList.module.css';

function AlertRowList({ rows }) {
  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <span className={styles.title}>Live Feed</span>
        <span className={styles.subtitle}>last {rows.length} events — placeholder for Phase 3 virtualized grid</span>
      </header>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Project</th>
              <th>Status</th>
              <th>ROI</th>
              <th>Budget</th>
              <th>Savings</th>
              <th>Robots</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <AlertRow key={row.internal_uid} row={row} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// Separate memoized component per row so React can skip rows that haven't changed.
const AlertRow = React.memo(function AlertRow({ row }) {
  const trRef = useRef(null);
  const alert = isAlertRow(row);

  // Trigger flash animation whenever row arrives as alert-worthy.
  // Using a layout effect so the class is added synchronously after DOM paint,
  // ensuring the keyframe restarts even if the same row fires twice in a row.
  useEffect(() => {
    const el = trRef.current;
    if (!el || !alert) return;

    // Remove first to force animation restart if same row re-triggers
    el.classList.remove(styles.flash);
    // Force reflow only on THIS element (not the list) to restart animation
    void el.offsetWidth;
    el.classList.add(styles.flash);

    function onEnd() {
      el.classList.remove(styles.flash);
    }
    el.addEventListener('animationend', onEnd, { once: true });
    return () => el.removeEventListener('animationend', onEnd);
  }, [row, alert]); // re-run when row object reference changes (new batch)

  const statusClass = {
    Active: styles.statusActive,
    Completed: styles.statusCompleted,
    Failed: styles.statusFailed,
    'On Hold': styles.statusHold,
  }[row.project_status] || '';

  const roiNegative = row.roi_percent < 0;

  return (
    <tr ref={trRef} className={styles.row}>
      <td className={styles.projectName} title={row.project_name}>
        {row.project_name}
      </td>
      <td>
        <span className={`${styles.badge} ${statusClass}`}>
          {row.project_status}
        </span>
      </td>
      <td className={`${styles.numeric} ${roiNegative ? styles.negative : ''}`}>
        {formatPercent(row.roi_percent)}
      </td>
      <td className={styles.numeric}>{formatCurrency(row.budget_usd)}</td>
      <td className={styles.numeric}>{formatCurrency(row.annual_savings_usd)}</td>
      <td className={styles.numeric}>{row.robots_deployed}</td>
    </tr>
  );
});

export default React.memo(AlertRowList);
