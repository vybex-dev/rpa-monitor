// src/components/RowInspector.jsx
// Bounty Task 1 — Paused-State Row Inspector Panel
//
// Opens as a slide-in side panel when the user clicks a row while paused.
// Shows all 18 CSV fields grouped into logical sections.
// Reuses formatCurrency / formatPercent / isAlertRow from utils/formatters.
// Closes on: X button, click outside, or Escape key.

import { useEffect, useCallback } from 'react';
import { formatCurrency, formatPercent, isAlertRow } from '../utils/formatters';
import styles from '../styles/RowInspector.module.css';

// ── Field group definitions ──────────────────────────────────────────────────
const GROUPS = [
  {
    id: 'identity',
    label: 'Identity',
    icon: '🪪',
    fields: [
      { key: 'project_id',   label: 'Project ID' },
      { key: 'company_id',   label: 'Company ID' },
      { key: 'project_name', label: 'Project Name' },
    ],
  },
  {
    id: 'status',
    label: 'Status',
    icon: '📌',
    fields: [
      { key: 'project_status',  label: 'Status' },
      { key: 'start_date',      label: 'Start Date' },
      { key: 'completion_date', label: 'Completion Date' },
    ],
  },
  {
    id: 'financials',
    label: 'Financials',
    icon: '💰',
    fields: [
      { key: 'budget_usd',         label: 'Budget',         fmt: formatCurrency },
      { key: 'annual_savings_usd', label: 'Annual Savings', fmt: formatCurrency },
      { key: 'roi_percent',        label: 'ROI %',          fmt: formatPercent  },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    icon: '⚙️',
    fields: [
      { key: 'robots_deployed',      label: 'Robots Deployed',  fmt: v => v != null ? v.toLocaleString() : '—' },
      { key: 'employee_hours_saved', label: 'Hrs Saved / Year', fmt: v => v != null ? v.toLocaleString() : '—' },
      { key: 'automation_type',      label: 'Automation Type' },
    ],
  },
  {
    id: 'metadata',
    label: 'Metadata',
    icon: '🏷️',
    fields: [
      { key: 'department',             label: 'Department' },
      { key: 'industry',               label: 'Industry' },
      { key: 'country',                label: 'Country' },
      { key: 'implementation_partner', label: 'Impl. Partner' },
      { key: 'ai_enabled',             label: 'AI Enabled',   fmt: v => (v === true || v === 'true' || v === 1) ? 'Yes' : 'No' },
      { key: 'cloud_deployment',       label: 'Cloud Deploy', fmt: v => (v === true || v === 'true' || v === 1) ? 'Yes' : 'No' },
    ],
  },
];

function formatValue(field, row) {
  const raw = row[field.key];
  if (field.fmt) return field.fmt(raw);
  return (raw !== null && raw !== undefined && raw !== '') ? String(raw) : '—';
}

function StatusBadge({ status }) {
  const map = {
    Active:    styles.statusActive,
    Completed: styles.statusCompleted,
    Failed:    styles.statusFailed,
    'On Hold': styles.statusOnHold,
  };
  const cls = map[status] ?? '';
  return <span className={`${styles.statusBadge} ${cls}`}>{status ?? '—'}</span>;
}

export default function RowInspector({ row, onClose }) {
  const isAlert = row ? isAlertRow(row) : false;

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (!row) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [row, handleKeyDown]);

  if (!row) return null;

  return (
    <>
      <div
        className={styles.backdrop}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`${styles.panel} ${isAlert ? styles.panelAlert : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Row Inspector"
      >
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>
            <span className={styles.panelIcon}>🔍</span>
            <div>
              <div className={styles.panelHeading}>Row Inspector</div>
              <div className={styles.panelSubtitle}>{row.project_name ?? row.project_id}</div>
            </div>
          </div>
          {isAlert && (
            <span className={styles.alertBadge}>
              {row.project_status === 'Failed' ? '⚠ Failed' : '⚠ Negative ROI'}
            </span>
          )}
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close inspector"
          >
            ✕
          </button>
        </div>

        <div className={styles.panelBody}>
          {GROUPS.map(group => (
            <section key={group.id} className={styles.group}>
              <div className={styles.groupHeader}>
                <span className={styles.groupIcon}>{group.icon}</span>
                <span className={styles.groupLabel}>{group.label}</span>
              </div>
              <div className={styles.groupFields}>
                {group.fields.map(field => {
                  const value = formatValue(field, row);
                  const isNegRoi = field.key === 'roi_percent' && typeof row.roi_percent === 'number' && row.roi_percent < 0;

                  return (
                    <div key={field.key} className={styles.fieldRow}>
                      <span className={styles.fieldLabel}>{field.label}</span>
                      {field.key === 'project_status' ? (
                        <StatusBadge status={row.project_status} />
                      ) : (
                        <span className={`${styles.fieldValue} ${isNegRoi ? styles.valueNegative : ''}`}>
                          {value}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className={styles.panelFooter}>
          <span className={styles.footerHint}>
            Press <kbd className={styles.kbd}>Esc</kbd> or click outside to close
          </span>
          <button className={styles.closeFooterBtn} onClick={onClose}>Close</button>
        </div>
      </aside>
    </>
  );
}
