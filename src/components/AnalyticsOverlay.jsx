// src/components/AnalyticsOverlay.jsx
// Bounty Task 2 — Paused-State Analytics Overlay
//
// Renders an overlay dashboard with three Chart.js charts aggregated from
// the current activeViewPool (respects all active filters / search / sort).
//
// Design constraints:
//   - Only visible while isPaused === true (button is disabled otherwise)
//   - Opening/closing has ZERO side-effects on pause state, queue, grid scroll
//   - Aggregation is computed once per open click (useMemo), not on every tick
//   - Uses react-chartjs-2 + chart.js (the only external charting library allowed)

import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import styles from '../styles/AnalyticsOverlay.module.css';
import {
  aggregateSavingsByDepartment,
  aggregateCountByStatus,
  aggregateAvgRoiByAutomationType,
} from '../utils/analytics';

// ── Register only what we use — keeps the bundle lean ─────────────────────────
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
);

// ── App color palette (mirrored from App.css / module files) ───────────────────
const PALETTE = {
  blue:     '#58a6ff',
  blueDeep: '#1d4ed8',
  green:    '#3fb950',
  red:      '#f87171',
  yellow:   '#d29922',
  cyan:     '#22d3ee',
  purple:   '#a78bfa',
  orange:   '#fb923c',
  teal:     '#2dd4bf',
  surface:  '#161b22',
  border:   '#21262d',
  text:     '#c9d1d9',
  muted:    '#6e7681',
};

// Status-specific colors matching the existing badge colours in the app
const STATUS_COLORS = {
  Active:    { bg: 'rgba(63,185,80,0.75)',  border: '#3fb950' },
  Completed: { bg: 'rgba(88,166,255,0.75)', border: '#58a6ff' },
  Planned:   { bg: 'rgba(210,153,34,0.75)', border: '#d29922' },
  Unknown:   { bg: 'rgba(110,118,129,0.7)', border: '#6e7681' },
};

// Bar palette for department / automation_type charts
const BAR_COLORS = [
  '#4f8cff', '#22d3ee', '#3fb950', '#d29922', '#f87171',
  '#a78bfa', '#fb923c', '#2dd4bf', '#f472b6', '#818cf8',
];

// Shared Chart.js option defaults that match the dark theme
function baseOptions(titleText) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false, // We render titles ourselves in JSX for styling control
      },
      tooltip: {
        backgroundColor: '#161b22',
        borderColor: '#21262d',
        borderWidth: 1,
        titleColor: '#e6edf3',
        bodyColor: '#c9d1d9',
        padding: 10,
        cornerRadius: 6,
      },
    },
    scales: {
      x: {
        ticks: {
          color: PALETTE.muted,
          font: { size: 11, family: "'Inter', 'Segoe UI', system-ui, sans-serif" },
          maxRotation: 35,
          minRotation: 0,
        },
        grid: { color: 'rgba(255,255,255,0.04)' },
        border: { color: '#21262d' },
      },
      y: {
        ticks: {
          color: PALETTE.muted,
          font: { size: 11, family: "'Inter', 'Segoe UI', system-ui, sans-serif" },
        },
        grid: { color: 'rgba(255,255,255,0.06)' },
        border: { color: '#21262d' },
      },
    },
  };
}

// ── Empty state placeholder ────────────────────────────────────────────────────
function EmptyState({ message = 'No data in current view' }) {
  return (
    <div className={styles.empty}>
      <span className={styles.emptyIcon}>📊</span>
      <span>{message}</span>
    </div>
  );
}

// ── Savings by Department — Horizontal-style bar (sorted descending) ───────────
function SavingsChart({ rows }) {
  const { labels, data } = useMemo(() => aggregateSavingsByDepartment(rows), [rows]);

  if (data.length === 0) return <EmptyState />;

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Annual Savings (USD)',
        data,
        backgroundColor: labels.map((_, i) => BAR_COLORS[i % BAR_COLORS.length] + 'cc'),
        borderColor:     labels.map((_, i) => BAR_COLORS[i % BAR_COLORS.length]),
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    ...baseOptions('Annual Savings by Department'),
    plugins: {
      ...baseOptions('Annual Savings by Department').plugins,
      tooltip: {
        ...baseOptions().plugins.tooltip,
        callbacks: {
          label: (ctx) => ` $${ctx.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      ...baseOptions().scales,
      y: {
        ...baseOptions().scales.y,
        ticks: {
          ...baseOptions().scales.y.ticks,
          callback: (v) => `$${(v / 1_000_000).toFixed(1)}M`,
        },
      },
    },
  };

  return (
    <div className={styles.chartWrap} style={{ height: 220 }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

// ── Count by Project Status — Doughnut ────────────────────────────────────────
function StatusDoughnutChart({ rows }) {
  const { labels, data } = useMemo(() => aggregateCountByStatus(rows), [rows]);

  if (data.length === 0) return <EmptyState />;

  const bgColors = labels.map(
    (l) => STATUS_COLORS[l]?.bg ?? 'rgba(110,118,129,0.7)',
  );
  const borderColors = labels.map(
    (l) => STATUS_COLORS[l]?.border ?? PALETTE.muted,
  );

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '62%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: PALETTE.text,
          padding: 14,
          font: { size: 12, family: "'Inter', 'Segoe UI', system-ui, sans-serif" },
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
      tooltip: {
        backgroundColor: '#161b22',
        borderColor: '#21262d',
        borderWidth: 1,
        titleColor: '#e6edf3',
        bodyColor: '#c9d1d9',
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
            return ` ${ctx.raw.toLocaleString()} rows (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className={styles.doughnutWrap}>
      <div style={{ width: 280, height: 280 }}>
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
}

// ── Avg ROI by Automation Type — Bar (top-8 + Other) ──────────────────────────
function RoiByTypeChart({ rows }) {
  const { labels, data } = useMemo(
    () => aggregateAvgRoiByAutomationType(rows),
    [rows],
  );

  if (data.length === 0) return <EmptyState />;

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Avg ROI (%)',
        data,
        backgroundColor: labels.map((_, i) => BAR_COLORS[i % BAR_COLORS.length] + 'cc'),
        borderColor:     labels.map((_, i) => BAR_COLORS[i % BAR_COLORS.length]),
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    ...baseOptions('Avg ROI by Automation Type'),
    plugins: {
      ...baseOptions().plugins,
      tooltip: {
        ...baseOptions().plugins.tooltip,
        callbacks: {
          label: (ctx) => ` ${ctx.raw}%`,
        },
      },
    },
    scales: {
      ...baseOptions().scales,
      y: {
        ...baseOptions().scales.y,
        ticks: {
          ...baseOptions().scales.y.ticks,
          callback: (v) => `${v}%`,
        },
      },
    },
  };

  return (
    <div className={styles.chartWrap} style={{ height: 220 }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

// ── AnalyticsOverlay (main export) ────────────────────────────────────────────
/**
 * @param {{ isOpen: boolean, onClose: () => void, activeViewPool: Object[] }} props
 */
export default function AnalyticsOverlay({ isOpen, onClose, activeViewPool }) {
  if (!isOpen) return null;

  const rowCount = activeViewPool.length;

  return (
    <>
      {/* Backdrop — click to close */}
      <div
        className={styles.backdrop}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Analytics View"
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className={styles.header}>
          <span className={styles.headerIcon}>📈</span>

          <div className={styles.headerTitle}>
            <div className={styles.headerHeading}>Analytics View</div>
            <div className={styles.headerSubtitle}>
              Aggregated over current filtered view-pool
            </div>
          </div>

          <span className={styles.pausedBadge}>
            <span className={styles.pausedDot} />
            Paused
          </span>

          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close Analytics View"
          >
            ✕
          </button>
        </div>

        {/* ── Meta bar ────────────────────────────────────────────────────── */}
        <div className={styles.metaBar}>
          Showing aggregates for{' '}
          <span className={styles.metaCount}>{rowCount.toLocaleString()}</span>{' '}
          {rowCount === 1 ? 'row' : 'rows'} in current view
        </div>

        {/* ── Charts ──────────────────────────────────────────────────────── */}
        <div className={styles.body}>
          {rowCount === 0 ? (
            <EmptyState message="No rows match the current filters — adjust filters or search to see charts." />
          ) : (
            <div className={styles.chartsGrid}>

              {/* Left col, row 1 — Savings by Department */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon}>💰</span>
                  <div className={styles.cardMeta}>
                    <div className={styles.cardTitle}>Annual Savings by Department</div>
                    <div className={styles.cardDesc}>
                      Sum of <code>annual_savings_usd</code> per department — sorted highest first
                    </div>
                  </div>
                </div>
                <SavingsChart rows={activeViewPool} />
              </div>

              {/* Right col, rows 1+2 — Status Doughnut */}
              <div className={`${styles.card} ${styles.doughnutCard}`}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon}>🟢</span>
                  <div className={styles.cardMeta}>
                    <div className={styles.cardTitle}>Projects by Status</div>
                    <div className={styles.cardDesc}>
                      Record count grouped by <code>project_status</code>
                    </div>
                  </div>
                </div>
                <StatusDoughnutChart rows={activeViewPool} />
              </div>

              {/* Left col, row 2 — Avg ROI by Automation Type */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon}>📊</span>
                  <div className={styles.cardMeta}>
                    <div className={styles.cardTitle}>Avg ROI by Automation Type</div>
                    <div className={styles.cardDesc}>
                      Average <code>roi_percent</code> per type — top 8 shown, rest collapsed to "Other"
                    </div>
                  </div>
                </div>
                <RoiByTypeChart rows={activeViewPool} />
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}
