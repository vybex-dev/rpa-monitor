// src/hooks/useLayoutVisibility.js
// Feature 6 — Operator Workspace Layout Persistence
//
// A small reusable hook that wraps localStorage with safe JSON parsing,
// fallback defaults, and a simple toggle API.
//
// Usage:
//   const { visibility, togglePanel, isPanelVisible } = useLayoutVisibility(
//     'rpa-layout-v1',          // localStorage key
//     { kpiBar: true, toolbar: true, grid: true }   // defaults
//   );
//
// Hard refresh restores the exact saved state.
// Unknown keys in storage are merged with defaults (forward-compat).
//
// Returns:
//   visibility      Object<panelId, boolean>
//   togglePanel     (panelId) => void
//   isPanelVisible  (panelId) => boolean  — convenience getter

import { useCallback, useState } from 'react';

/**
 * @param {string} storageKey
 * @param {Object<string, boolean>} defaults
 */
export function useLayoutVisibility(storageKey, defaults) {
  const [visibility, setVisibility] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return { ...defaults };
      const parsed = JSON.parse(raw);
      // Merge: persisted values override defaults; new default keys fill gaps
      return { ...defaults, ...parsed };
    } catch {
      return { ...defaults };
    }
  });

  const persist = useCallback((next) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Quota exceeded or private mode — silently continue
    }
  }, [storageKey]);

  const togglePanel = useCallback((panelId) => {
    setVisibility((prev) => {
      const next = { ...prev, [panelId]: !prev[panelId] };
      persist(next);
      return next;
    });
  }, [persist]);

  const isPanelVisible = useCallback((panelId) => {
    return visibility[panelId] !== false; // default to true if key absent
  }, [visibility]);

  return { visibility, togglePanel, isPanelVisible };
}
