// src/hooks/useViewPool.js
// THE CENTRAL DERIVED-STATE PIPELINE.
// This is the single hook that Phase 3 (virtualized grid), Phase 4 (multi-sort),
// and any future display layer consume. It owns NO stream state — it only
// derives from rowMap.
//
// Pipeline (in order):
//   rawData (Map) → materialize → filter → search → sort → activeViewPool
//
// Composition rationale:
//   filter first:  pure equality checks, cheapest, reduces set most
//   search second: substring scan, runs on already-filtered set
//   sort last:     O(m log m), runs on smallest possible set
//
// Performance:
//   - useMemo deps: [rowMap, filters, searchQuery, sortConfig]
//   - rowMap is a new Map reference only when the stream dispatches a batch
//   - So this pipeline only re-runs when SOMETHING actually changed
//   - Sort operates on the post-filter+search subset, not all 50k rows
//
// Public API:
//   const { activeViewPool, totalCount, filteredCount } = useViewPool({
//     rowMap,
//     filters,       // from useFilterState
//     searchQuery,   // debounced string
//     sortConfig,    // from useSortState
//   });
//
// Phase 3 virtual grid should import this hook and pass `activeViewPool`
// directly to its row-recycling engine. The shape of activeViewPool is
// stable: an ordered Object[] of row objects matching the CSV schema.

import { useMemo } from 'react';
import { filterRows } from '../utils/filterRows';
import { searchRows } from '../utils/searchRows';
import { sortRows } from '../utils/sortRows';

/**
 * @param {{
 *   rowMap: Map<string, Object>,
 *   filters: { automation_type: Set, department: Set, industry: Set },
 *   searchQuery: string,
 *   sortConfig: { key: string, dir: 'asc'|'desc' } | null,
 * }} params
 * @returns {{ activeViewPool: Object[], totalCount: number, filteredCount: number }}
 */
export function useViewPool({ rowMap, filters, searchQuery, sortConfig }) {
  const totalCount = rowMap.size;

  const activeViewPool = useMemo(() => {
    // Step 1: Materialize Map → Array (O(n))
    const all = [...rowMap.values()];

    // Step 2: Apply categorical filters (O(n))
    const afterFilter = filterRows(all, filters);

    // Step 3: Apply fuzzy search (O(m × fields))
    const afterSearch = searchRows(afterFilter, searchQuery);

    // Step 4: Apply sort (O(m log m))
    return sortRows(afterSearch, sortConfig);
  }, [rowMap, filters, searchQuery, sortConfig]);

  return {
    activeViewPool,
    totalCount,
    filteredCount: activeViewPool.length,
  };
}
