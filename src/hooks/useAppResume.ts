import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const STALE_THRESHOLD_MS = 2 * 60 * 1000; // 2분

export const useAppResume = (): void => {
  const queryClient = useQueryClient();
  const hiddenAtRef = useRef<number | null>(null);

  useEffect(() => {
    const handleVisibility = (): void => {
      if (document.visibilityState === 'hidden') {
        hiddenAtRef.current = Date.now();
      } else if (document.visibilityState === 'visible' && hiddenAtRef.current !== null) {
        const elapsed = Date.now() - hiddenAtRef.current;
        hiddenAtRef.current = null;
        if (elapsed >= STALE_THRESHOLD_MS) {
          queryClient.invalidateQueries();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [queryClient]);
};
