// src/utils/formatters.js
// Pure utility functions — imported by every feature that renders numeric data.
// Zero side effects; safe to call on every render.

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

/**
 * formatCurrency(value) → "$1,069,470"
 * Handles null / undefined / NaN gracefully.
 */
export function formatCurrency(value) {
  const n = Number(value);
  if (!isFinite(n)) return '$—';
  return currencyFormatter.format(n);
}

/**
 * formatPercent(value) → "54.20%"
 * roi_percent is NOT clamped at the data layer (intentional negatives),
 * but we clamp display to [-9999.99, 9999.99] to prevent runaway widths.
 * Always 2 decimal places so digit width is stable (tabular-nums in CSS
 * handles the rest — no layout shift from digit changes).
 */
export function formatPercent(value) {
  const n = Number(value);
  if (!isFinite(n)) return '—%';
  const clamped = Math.max(-9999.99, Math.min(9999.99, n));
  return clamped.toFixed(2) + '%';
}

/**
 * isAlertRow(row) → boolean
 * Single source of truth for Feature 3 alert condition.
 * Used by placeholder list and (later) virtualized grid.
 */
export function isAlertRow(row) {
  return row.project_status === 'Failed' || row.roi_percent < 0;
}
