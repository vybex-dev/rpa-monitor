// src/utils/sortRows.js
// Pure sort — takes an array, returns a NEW sorted array. Never mutates input.
// Called by useViewPool.
//
// Phase 4 upgrade: accepts EITHER:
//   - Legacy single-config:  { key, dir }            (Feature 4 compat)
//   - Multi-sort stack:      [{ key, dir }, ...]      (Feature 9)
//
// Supported sort keys: 'budget_usd' | 'roi_percent' | 'employee_hours_saved'
// Direction: 'asc' | 'desc'

/**
 * @param {Object[]} rows
 * @param {({ key: string, dir: 'asc'|'desc' } | Array<{ key: string, dir: 'asc'|'desc' }> | null)} sortConfig
 * @returns {Object[]}
 */
export function sortRows(rows, sortConfig) {
  if (!sortConfig) return rows;

  // Normalise to array — support legacy single-object shape from Phase 2
  const stack = Array.isArray(sortConfig) ? sortConfig : [sortConfig];
  if (stack.length === 0) return rows;

  return [...rows].sort((a, b) => {
    for (const { key, dir } of stack) {
      if (!key) continue;
      const av = a[key] ?? -Infinity;
      const bv = b[key] ?? -Infinity;
      const diff = (av - bv) * (dir === 'asc' ? 1 : -1);
      if (diff !== 0) return diff;   // tiebreak: move to next key
    }
    return 0;
  });
}
