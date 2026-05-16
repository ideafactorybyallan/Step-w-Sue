'use client';
import { useEffect, useRef } from 'react';

// If the PWA has been hidden longer than this, do a full reload on wake
// so users pick up new deploys and fresh data. 30 minutes is short enough
// to feel "always fresh" and long enough to avoid mid-task reloads.
const STALE_AFTER_MS = 30 * 60 * 1000;

export function useStaleReload() {
  const hiddenAt = useRef<number | null>(null);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt.current = Date.now();
        return;
      }
      if (document.visibilityState === 'visible' && hiddenAt.current !== null) {
        const hiddenFor = Date.now() - hiddenAt.current;
        hiddenAt.current = null;
        if (hiddenFor > STALE_AFTER_MS) {
          window.location.reload();
        }
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);
}
