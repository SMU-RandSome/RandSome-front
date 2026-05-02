import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDisplayMode } from '@/store/displayModeStore';
import { RefreshCw } from 'lucide-react';

const PULL_THRESHOLD = 64;
const MAX_PULL = 100;
const INDICATOR_HEIGHT = 48;

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
  const indicatorRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number | null>(null);
  const pullDistanceRef = useRef(0);
  const isPullingRef = useRef(false);
  const isRefreshingRef = useRef(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => { onRefreshRef.current = onRefresh; }, [onRefresh]);

  /** transition 붙이고 원위치로 복귀 */
  const animateReset = useCallback((): void => {
    const indicator = indicatorRef.current;
    const content = contentRef.current;
    const icon = iconRef.current;
    if (!indicator || !content || !icon) return;

    const transition = 'top 0.2s ease';
    indicator.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
    content.style.transition = transition;

    indicator.style.transform = `translateY(-${INDICATOR_HEIGHT}px)`;
    indicator.style.opacity = '0';
    content.style.top = '0px';
    icon.style.transform = 'rotate(0deg)';

    const cleanup = (): void => {
      clearTimeout(fallbackTimer);
      indicator.style.transition = '';
      content.style.transition = '';
      content.style.top = '';
      content.removeEventListener('transitionend', cleanup);
    };
    const fallbackTimer = setTimeout(cleanup, 300);
    content.addEventListener('transitionend', cleanup, { once: true });
  }, []);

  const handleRefresh = useCallback(async (): Promise<void> => {
    setIsRefreshing(true);
    isRefreshingRef.current = true;

    // 새로고침 중 인디케이터 위치 고정
    const indicator = indicatorRef.current;
    const content = contentRef.current;
    const icon = iconRef.current;
    if (indicator && content && icon) {
      indicator.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
      content.style.transition = 'top 0.2s ease';
      indicator.style.transform = 'translateY(0)';
      indicator.style.opacity = '1';
      content.style.top = `${INDICATOR_HEIGHT}px`;
      icon.style.transform = '';
    }

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
      animateReset();
    }
  }, [queryClient, animateReset]);

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
        isPullingRef.current = false;
        return;
      }

      const deltaY = e.touches[0].clientY - startYRef.current;
      if (deltaY <= 0) {
        if (isPullingRef.current) {
          pullDistanceRef.current = 0;
          isPullingRef.current = false;
          // DOM 직접 리셋
          const indicator = indicatorRef.current;
          const content = contentRef.current;
          const icon = iconRef.current;
          if (indicator && content && icon) {
            indicator.style.transform = `translateY(-${INDICATOR_HEIGHT}px)`;
            indicator.style.opacity = '0';
            content.style.top = '';
            icon.style.transform = 'rotate(0deg)';
          }
        }
        return;
      }

      if (!isPullingRef.current) {
        isPullingRef.current = true;
      }
      e.preventDefault();
      const distance = Math.min(deltaY * 0.5, MAX_PULL);
      pullDistanceRef.current = distance;
      const progress = Math.min(distance / PULL_THRESHOLD, 1);

      // DOM 직접 조작 — React 리렌더 없음
      const indicator = indicatorRef.current;
      const content = contentRef.current;
      const icon = iconRef.current;
      if (indicator && content && icon) {
        indicator.style.transition = '';
        content.style.transition = '';
        content.style.top = `${distance}px`;
        indicator.style.transform = `translateY(${distance - INDICATOR_HEIGHT}px)`;
        indicator.style.opacity = String(progress);
        icon.style.transform = `rotate(${progress * 270}deg)`;
        icon.style.color = distance >= PULL_THRESHOLD ? 'var(--color-indigo-500)' : 'var(--color-slate-400)';
      }
    };

    const onTouchEnd = (): void => {
      if (isRefreshingRef.current) return;
      startYRef.current = null;
      isPullingRef.current = false;

      if (pullDistanceRef.current >= PULL_THRESHOLD) {
        handleRefresh();
      } else if (pullDistanceRef.current > 0) {
        pullDistanceRef.current = 0;
        animateReset();
      } else {
        pullDistanceRef.current = 0;
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
  }, [isStandalone, handleRefresh, animateReset]);

  if (!isStandalone) {
    return <>{children}</>;
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        ref={indicatorRef}
        className="absolute top-0 inset-x-0 flex items-center justify-center pointer-events-none"
        style={{ height: INDICATOR_HEIGHT, transform: `translateY(-${INDICATOR_HEIGHT}px)`, opacity: 0, willChange: 'transform, opacity' }}
      >
        <RefreshCw
          ref={iconRef}
          size={20}
          className={isRefreshing ? 'text-indigo-500 animate-spin' : 'text-slate-400'}
        />
      </div>
      <div ref={contentRef} style={{ position: 'relative' }}>
        {children}
      </div>
    </div>
  );
};
