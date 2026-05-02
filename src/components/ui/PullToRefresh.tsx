import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { useDisplayMode } from '@/store/displayModeStore';
import { RefreshCw } from 'lucide-react';

const PULL_THRESHOLD = 64;
const MAX_PULL = 100;

/** 터치 대상이 fixed overlay(모달/바텀시트) 내부인지 확인 */
const isInsideFixedOverlay = (target: EventTarget | null, container: HTMLElement | null): boolean => {
  let el = target as HTMLElement | null;
  while (el && el !== document.body) {
    if (el === container) return false;
    const position = window.getComputedStyle(el).position;
    if (position === 'fixed') return true;
    el = el.parentElement;
  }
  return false;
};

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ children, onRefresh }) => {
  const { isStandalone } = useDisplayMode();
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number | null>(null);
  const pullDistanceRef = useRef(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isRefreshingRef = useRef(false);
  const isPullingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => { onRefreshRef.current = onRefresh; }, [onRefresh]);

  const handleRefresh = useCallback(async (): Promise<void> => {
    setIsRefreshing(true);
    isRefreshingRef.current = true;
    try {
      if (onRefreshRef.current) {
        await onRefreshRef.current();
      } else {
        await queryClient.invalidateQueries();
        await queryClient.refetchQueries({ type: 'active' });
      }
    } finally {
      setIsRefreshing(false);
      isRefreshingRef.current = false;
      pullDistanceRef.current = 0;
      setPullDistance(0);
    }
  }, [queryClient]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isStandalone) return;

    const onTouchStart = (e: TouchEvent): void => {
      if (isRefreshingRef.current) return;
      if (window.scrollY > 0) return;
      if (isInsideFixedOverlay(e.target, container)) return;
      startYRef.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent): void => {
      if (isRefreshingRef.current || startYRef.current === null) return;
      if (window.scrollY > 0) {
        startYRef.current = null;
        pullDistanceRef.current = 0;
        setPullDistance(0);
        isPullingRef.current = false;
        return;
      }

      const deltaY = e.touches[0].clientY - startYRef.current;
      if (deltaY <= 0) {
        if (isPullingRef.current) {
          pullDistanceRef.current = 0;
          setPullDistance(0);
          isPullingRef.current = false;
        }
        return;
      }

      isPullingRef.current = true;
      e.preventDefault();
      const distance = Math.min(deltaY * 0.5, MAX_PULL);
      pullDistanceRef.current = distance;
      setPullDistance(distance);
    };

    const onTouchEnd = (): void => {
      if (isRefreshingRef.current) return;
      startYRef.current = null;
      isPullingRef.current = false;

      if (pullDistanceRef.current >= PULL_THRESHOLD) {
        handleRefresh();
      } else {
        pullDistanceRef.current = 0;
        setPullDistance(0);
      }
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd);

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
    };
  }, [isStandalone, handleRefresh]);

  if (!isStandalone) {
    return <>{children}</>;
  }

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const showIndicator = pullDistance > 0 || isRefreshing;

  return (
    <div ref={containerRef} className="relative">
      <AnimatePresence>
        {showIndicator && (
          <motion.div
            className="flex items-center justify-center pointer-events-none"
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: isRefreshing ? 48 : pullDistance,
              opacity: isRefreshing ? 1 : progress,
            }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              animate={{ rotate: isRefreshing ? 360 : progress * 270 }}
              transition={isRefreshing ? { repeat: Infinity, duration: 0.8, ease: 'linear' } : { duration: 0 }}
            >
              <RefreshCw
                size={20}
                className={pullDistance >= PULL_THRESHOLD || isRefreshing ? 'text-indigo-500' : 'text-slate-400'}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
};
