// src/hooks/useMultiSortState.js
// Feature 9 — Multi-Column Concurrent Sorter
//
// Replaces useSortState (single-column) with a compound sort stack.
//
// Behaviour:
//   plain click   → reset stack to single key (asc → desc → clear, same key)
//   shift+click   → append/update key as secondary (or tertiary) sort
//
// Stack depth: max 3 keys. Adding a 4th replaces the oldest non-primary key.
//
// Stack shape: [{ key, dir }, ...]   — index 0 = highest priority
//
// Returns:
//   sortStack     Array<{ key, dir }>  — consumed by useViewPool / sortRows
//   handleSort    (key, shiftHeld) → void   — called from column header click
//   getSortMeta   (key) → { priority: number|null, dir: string|null }
//                         priority = 1-based display label, null if not in stack

import { useCallback, useState } from 'react';

export const SORTABLE_KEYS = ['budget_usd', 'roi_percent', 'employee_hours_saved'];
const MAX_STACK = 3;

export function useMultiSortState() {
  const [sortStack, setSortStack] = useState([]);

  const handleSort = useCallback((key, shiftHeld) => {
    setSortStack((prev) => {
      if (!shiftHeld) {
        // ── Plain click: single-key mode ──
        const existing = prev.find(s => s.key === key);
        if (!existing) {
          // New key → start ascending
          return [{ key, dir: 'asc' }];
        }
        if (existing.dir === 'asc') {
          return [{ key, dir: 'desc' }];
        }
        // Was desc → clear sort entirely
        return [];
      }

      // ── Shift+click: compound mode ──
      const idx = prev.findIndex(s => s.key === key);

      if (idx === -1) {
        // Key not in stack — append (respect MAX_STACK)
        const next = [...prev, { key, dir: 'asc' }];
        return next.slice(0, MAX_STACK);
      }

      const entry = prev[idx];
      if (entry.dir === 'asc') {
        // Cycle to desc
        const next = [...prev];
        next[idx] = { key, dir: 'desc' };
        return next;
      }
      // Was desc → remove from stack
      return prev.filter((_, i) => i !== idx);
    });
  }, []);

  // Helper: returns display metadata for a key, or nulls if not sorted
  const getSortMeta = useCallback((key) => {
    const idx = sortStack.findIndex(s => s.key === key);
    if (idx === -1) return { priority: null, dir: null };
    return { priority: idx + 1, dir: sortStack[idx].dir };
  }, [sortStack]);

  return { sortStack, handleSort, getSortMeta };
}
