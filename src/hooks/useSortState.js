// src/hooks/useSortState.js
// Manages single-column sort config.
// Clicking the same key cycles: asc → desc → null (unsorted).
// Clicking a new key resets to asc.
//
// Returns:
//   sortConfig: { key: string, dir: 'asc'|'desc' } | null
//   toggleSort(key): function to call from column header onClick

import { useCallback, useState } from 'react';

export const SORTABLE_KEYS = ['budget_usd', 'roi_percent', 'employee_hours_saved'];

export function useSortState() {
  const [sortConfig, setSortConfig] = useState(null);

  const toggleSort = useCallback((key) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) {
        // New column: start ascending
        return { key, dir: 'asc' };
      }
      if (prev.dir === 'asc') {
        return { key, dir: 'desc' };
      }
      // Was desc: clear sort
      return null;
    });
  }, []);

  return { sortConfig, toggleSort };
}
