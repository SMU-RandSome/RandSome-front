import React, { useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { useDisplayMode } from '@/store/displayModeStore';
import { RefreshCw } from 'lucide-react';

const PULL_THRESHOLD = 64;
const MAX_PULL = 100;

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ children, onRefresh }) => {
  const { isPWA } = useDisplayMode();
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isPullingRef = useRef(false);

  const handleRefresh = useCallback(async (): Promise<void> => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        await queryClient.invalidateQueries();
        await queryClient.refetchQueries({ type: 'active' });
      }
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  }, [onRefresh, queryClient]);

  const handleTouchStart = useCallback((e: React.TouchEvent): void => {
    if (isRefreshing) return;
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;
    startYRef.current = e.touches[0].clientY;
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent): void => {
    if (isRefreshing || startYRef.current === null) return;
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) {
      startYRef.current = null;
      setPullDistance(0);
      isPullingRef.current = false;
      return;
    }

    const deltaY = e.touches[0].clientY - startYRef.current;
    if (deltaY <= 0) {
      if (isPullingRef.current) {
        setPullDistance(0);
        isPullingRef.current = false;
      }
      return;
    }

    isPullingRef.current = true;
    e.preventDefault();
    const distance = Math.min(deltaY * 0.5, MAX_PULL);
    setPullDistance(distance);
  }, [isRefreshing]);

  const handleTouchEnd = useCallback((): void => {
    if (isRefreshing) return;
    startYRef.current = null;
    isPullingRef.current = false;

    if (pullDistance >= PULL_THRESHOLD) {
      handleRefresh();
    } else {
      setPullDistance(0);
    }
  }, [isRefreshing, pullDistance, handleRefresh]);

  if (!isPWA) {
    return <>{children}</>;
  }

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const showIndicator = pullDistance > 0 || isRefreshing;

  return (
    <div
      ref={containerRef}
      className="relative h-full overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
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
