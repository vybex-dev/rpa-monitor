// src/components/Toolbar.jsx
// Feature 7: Categorical Dropdown Filters
// Feature 10: Multi-Field Fuzzy Search
//
// Renders a search input + three filter dropdowns (automation_type, department, industry).
// Search input is uncontrolled at the DOM level; we only propagate to parent
// after 150ms debounce to avoid firing the search pipeline on every keystroke.
//
// Filter dropdowns are custom-built (no <select multiple>):
//   - Click the button to open/close a checklist panel
//   - Check/uncheck individual values
//   - Clicking outside closes the open dropdown
//
// The Toolbar receives all unique values for each filter field as props
// (computed once from rowMap in App.jsx via useMemo — not re-derived here).

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from '../styles/Toolbar.module.css';
import { exportToCsv } from '../utils/exportToCsv';

// ─── Search Box ───────────────────────────────────────────────────────────────

export function SearchBox({ onSearch }) {
  const timerRef = useRef(null);

  const handleChange = useCallback((e) => {
    const val = e.target.value;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onSearch(val), 150);
  }, [onSearch]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div className={styles.searchWrap}>
      <span className={styles.searchIcon}>⌕</span>
      <input
        className={styles.searchInput}
        type="text"
        placeholder="Search project, company, partner, country…"
        onChange={handleChange}
        spellCheck={false}
        autoComplete="off"
      />
    </div>
  );
}

// ─── Single Filter Dropdown ───────────────────────────────────────────────────

function FilterDropdown({ label, field, options, activeSet, onToggle, onClear }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const count = activeSet.size;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onDoc(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div className={styles.dropdownWrap} ref={wrapRef}>
      <button
        className={`${styles.dropdownBtn} ${count > 0 ? styles.dropdownBtnActive : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{label}</span>
        {count > 0 && <span className={styles.badge}>{count}</span>}
        <span className={styles.chevron}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelLabel}>{label}</span>
            {count > 0 && (
              <button className={styles.clearBtn} onClick={() => { onClear(field); }}>
                Clear
              </button>
            )}
          </div>
          <ul className={styles.optionList}>
            {options.map((val) => (
              <li key={val}>
                <label className={styles.optionLabel}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={activeSet.has(val)}
                    onChange={() => onToggle(field, val)}
                  />
                  <span className={styles.optionText}>{val}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────

const FILTER_CONFIG = [
  { field: 'automation_type', label: 'Type' },
  { field: 'department',      label: 'Dept' },
  { field: 'industry',        label: 'Industry' },
];

export function Toolbar({
  filters,
  filterOptions,   // { automation_type: string[], department: string[], industry: string[] }
  onToggleFilter,
  onClearFilter,
  onClearAll,
  hasActiveFilters,
  onSearch,
  filteredCount,
  totalCount,
  activeViewPool,
}) {
  return (
    <div className={`${styles.toolbar} glassmorphism`}>
      <SearchBox onSearch={onSearch} />

      <div className={styles.filterGroup}>
        {FILTER_CONFIG.map(({ field, label }) => (
          <FilterDropdown
            key={field}
            field={field}
            label={label}
            options={filterOptions[field] || []}
            activeSet={filters[field]}
            onToggle={onToggleFilter}
            onClear={onClearFilter}
          />
        ))}

        {hasActiveFilters && (
          <button className={styles.clearAllBtn} onClick={onClearAll}>
            ✕ Clear all
          </button>
        )}
      </div>

      <div className={styles.countBadge}>
        <span className={styles.countNum}>{filteredCount.toLocaleString()}</span>
        <span className={styles.countOf}>/ {totalCount.toLocaleString()} rows</span>
      </div>

      <button className={styles.exportBtn} onClick={() => exportToCsv(activeViewPool)}>
        Export CSV
      </button>
    </div>
  );
}
