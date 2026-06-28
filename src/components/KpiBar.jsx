// src/components/KpiBar.jsx
// Feature 1: High-Density KPIs Dashboard
//
// Re-render strategy: KpiBar receives only the three kpi numbers as props.
// React.memo ensures it skips re-render when parent re-renders for unrelated
// reasons. The numbers themselves change every ~200ms (stream cadence) which
// is the minimum useful update rate — no additional throttling needed.
// Using font-variant-numeric: tabular-nums (in CSS) prevents layout shift
// as digit widths change under rapid updates.

import React, { useEffect, useRef } from 'react';
import { formatCurrency } from '../utils/formatters';
import styles from '../styles/KpiBar.module.css';

const ACCENT_COLORS = {
  cyan: '#22d3ee',
  violet: '#a78bfa',
  emerald: '#34d399',
};

function KpiBar({ kpis }) {
  const { totalRowsProcessed, totalRobotsDeployed, totalAnnualSavings, history } = kpis;

  return (
    <div className={styles.bar} role="region" aria-label="Live KPI counters">
      <KpiCard
        label="Rows Processed"
        value={totalRowsProcessed.toLocaleString('en-US')}
        accent="cyan"
        history={history?.rows}
      />
      <KpiCard
        label="Robots Deployed"
        value={totalRobotsDeployed.toLocaleString('en-US')}
        accent="violet"
        history={history?.robots}
      />
      <KpiCard
        label="Cumulative Savings"
        value={formatCurrency(totalAnnualSavings)}
        accent="emerald"
        history={history?.savings}
      />
    </div>
  );
}

function KpiCard({ label, value, accent, history }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!history || history.length < 2 || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Scale for high DPI displays if needed, but keeping it simple for perf
    ctx.clearRect(0, 0, width, height);

    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;

    const color = ACCENT_COLORS[accent];

    ctx.beginPath();
    history.forEach((val, i) => {
      const x = (i / (history.length - 1)) * width;
      const y = height - ((val - min) / range) * height * 0.7 - height * 0.15;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Fill gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, `${color}30`); // subtle top
    gradient.addColorStop(1, `${color}00`); // transparent bottom
    
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fillStyle = gradient;
    ctx.fill();
  }, [history, accent]);

  return (
    <div className={`${styles.card} ${styles[accent]}`}>
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={64} 
        className={styles.sparkline}
        aria-hidden="true" 
      />
      <div className={styles.cardContent}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
      </div>
    </div>
  );
}

export default React.memo(KpiBar);
