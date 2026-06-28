// src/hooks/usePauseQueue.js
// Feature 5 — Pause/Play Pipeline Buffer (React side)
//
// FIX (Phase 5): togglePause now branches on React's own `isPaused` ref
// instead of `ctrl.isPaused` (engine state). This eliminates the desync
// risk where a rapid double-click could leave React and the engine in
// opposite pause states.
//
// Exports:
//   { isPaused, queueLength, togglePause }

import { useState, useRef, useCallback, useEffect } from 'react';

export function usePauseQueue() {
  const [isPaused, setIsPaused] = useState(false);
  const [queueLength, setQueueLength] = useState(0);

  // Keep a ref so togglePause's closure always reads the latest value
  // without needing isPaused in its dependency array (avoids stale closure)
  const isPausedRef = useRef(false);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

  const badgeIntervalRef = useRef(null);

  const startBadgeTicker = useCallback(() => {
    if (badgeIntervalRef.current) return;
    badgeIntervalRef.current = setInterval(() => {
      const ctrl = window.rpaStreamControl;
      if (ctrl) setQueueLength(ctrl.queueLength);
    }, 200);
  }, []);

  const stopBadgeTicker = useCallback(() => {
    if (badgeIntervalRef.current) {
      clearInterval(badgeIntervalRef.current);
      badgeIntervalRef.current = null;
    }
  }, []);

  const togglePause = useCallback(() => {
    const ctrl = window.rpaStreamControl;
    if (!ctrl) {
      console.warn('[usePauseQueue] rpaStreamControl not ready yet');
      return;
    }

    // Branch on React ref — never on ctrl.isPaused — to stay in sync
    if (!isPausedRef.current) {
      // ── Pause ──
      ctrl.pause();
      setIsPaused(true);
      isPausedRef.current = true;
      setQueueLength(0);
      startBadgeTicker();
    } else {
      // ── Resume ──
      // Engine's resume() flushes pendingQueue into the original callback
      // (useStreamState's handleBatch) synchronously before returning,
      // so state updates land in the same React batch as setIsPaused(false).
      stopBadgeTicker();
      ctrl.resume();
      setIsPaused(false);
      isPausedRef.current = false;
      setQueueLength(0);
    }
  }, [startBadgeTicker, stopBadgeTicker]);

  // Clean up badge ticker on unmount
  useEffect(() => () => stopBadgeTicker(), [stopBadgeTicker]);

  return { isPaused, queueLength, togglePause };
}
