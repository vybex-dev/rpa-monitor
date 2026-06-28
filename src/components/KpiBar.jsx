// src/components/KpiBar.jsx
// Feature 1: High-Density KPIs Dashboard
//
// Re-render strategy: KpiBar receives only the three kpi numbers as props.
// React.memo ensures it skips re-render when parent re-renders for unrelated
// reasons. The numbers themselves change every ~200ms (stream cadence) which
// is the minimum useful update rate — no additional throttling needed.
// Using font-variant-numeric: tabular-nums (in CSS) prevents layout shift
// as digit widths change under rapid updates.

import React from 'react';
import { formatCurrency } from '../utils/formatters';
import styles from '../styles/KpiBar.module.css';

function KpiBar({ kpis }) {
  const { totalRowsProcessed, totalRobotsDeployed, totalAnnualSavings } = kpis;

  return (
    <div className={styles.bar} role="region" aria-label="Live KPI counters">
      <KpiCard
        label="Rows Processed"
        value={totalRowsProcessed.toLocaleString('en-US')}
        accent="cyan"
      />
      <KpiCard
        label="Robots Deployed"
        value={totalRobotsDeployed.toLocaleString('en-US')}
        accent="violet"
      />
      <KpiCard
        label="Cumulative Savings"
        value={formatCurrency(totalAnnualSavings)}
        accent="emerald"
      />
    </div>
  );
}

function KpiCard({ label, value, accent }) {
  return (
    <div className={`${styles.card} ${styles[accent]}`}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
}

export default React.memo(KpiBar);
