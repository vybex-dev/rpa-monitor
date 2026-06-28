// src/hooks/useFilterState.js
// Manages multi-select categorical filter state for:
//   automation_type, department, industry
//
// Each filter field holds a Set<string>.
// Empty Set = "show all" (no filter applied for that field).
//
// Returns:
//   filters: { automation_type: Set, department: Set, industry: Set }
//   toggleFilter(field, value): add value if absent, remove if present
//   clearFilter(field): reset one field to empty Set
//   clearAllFilters(): reset everything

import { useCallback, useState } from 'react';

const EMPTY_FILTERS = {
  automation_type: new Set(),
  department: new Set(),
  industry: new Set(),
};

export const FILTER_FIELDS = ['automation_type', 'department', 'industry'];

export function useFilterState() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const toggleFilter = useCallback((field, value) => {
    setFilters((prev) => {
      const prevSet = prev[field];
      const nextSet = new Set(prevSet);
      if (nextSet.has(value)) {
        nextSet.delete(value);
      } else {
        nextSet.add(value);
      }
      return { ...prev, [field]: nextSet };
    });
  }, []);

  const clearFilter = useCallback((field) => {
    setFilters((prev) => ({ ...prev, [field]: new Set() }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
  }, []);

  const hasActiveFilters = FILTER_FIELDS.some((f) => filters[f].size > 0);

  return { filters, toggleFilter, clearFilter, clearAllFilters, hasActiveFilters };
}
