// src/hooks/useStreamState.js
// Central stream state engine consumed by all phases.
// Architecture: useReducer owns a Map<uid, row> for O(1) upserts.
// KPI sums are maintained incrementally in the reducer — NOT recomputed
// from the full Map on every dispatch — so render cost is O(batch_size),
// not O(total_rows). This is the key guard against layout thrashing under
// high-frequency updates.

import { useEffect, useReducer, useCallback } from 'react';

const MAX_RECENT = 30; // temporary placeholder list size (Feature 3 visibility)

const initialState = {
  rowMap: new Map(),           // uid → row (full live pool)
  recentRows: [],              // last MAX_RECENT rows (for placeholder grid)
  kpis: {
    totalRowsProcessed: 0,     // running count of every mutation event
    totalRobotsDeployed: 0,    // running sum of robots_deployed
    totalAnnualSavings: 0,     // running sum of annual_savings_usd
  },
};

function streamReducer(state, action) {
  if (action.type !== 'BATCH') return state;

  const { batch } = action;
  const nextMap = new Map(state.rowMap);

  let deltaRobots = 0;
  let deltaSavings = 0;

  for (const row of batch) {
    const prev = nextMap.get(row.internal_uid);

    // Incremental KPI delta: subtract old values before upserting
    if (prev) {
      deltaRobots -= (prev.robots_deployed || 0);
      deltaSavings -= (prev.annual_savings_usd || 0);
    }

    deltaRobots += (row.robots_deployed || 0);
    deltaSavings += (row.annual_savings_usd || 0);

    nextMap.set(row.internal_uid, row);
  }

  // Prepend batch to recentRows, keep last MAX_RECENT
  const nextRecent = [...batch, ...state.recentRows].slice(0, MAX_RECENT);

  return {
    rowMap: nextMap,
    recentRows: nextRecent,
    kpis: {
      totalRowsProcessed: state.kpis.totalRowsProcessed + batch.length,
      totalRobotsDeployed: state.kpis.totalRobotsDeployed + deltaRobots,
      totalAnnualSavings: state.kpis.totalAnnualSavings + deltaSavings,
    },
  };
}

export function useStreamState() {
  const [state, dispatch] = useReducer(streamReducer, initialState);

  const handleBatch = useCallback((batch) => {
    dispatch({ type: 'BATCH', batch });
  }, []);

  useEffect(() => {
    if (typeof window.initializeRpaStream !== 'function') {
      console.error('[useStreamState] window.initializeRpaStream not found — check index.html script order');
      return;
    }
    window.initializeRpaStream(handleBatch);
    // No cleanup: stream runs for the lifetime of the app
  }, [handleBatch]);

  // Return shape consumed by all downstream phases:
  // kpis        → Feature 1 (KpiBar)
  // recentRows  → Feature 3 (placeholder alert list, replaced by virtualized grid in Phase 3)
  // rowMap      → Features 4, 7, 8, 9, 10 (sort/filter/search/virtual grid)
  return {
    kpis: state.kpis,
    recentRows: state.recentRows,
    rowMap: state.rowMap,
  };
}
