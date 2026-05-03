import { useEffect } from 'react';

/**
 * body 스크롤을 잠그는 훅.
 *
 * overflow:hidden + iOS touchmove 차단 방식을 사용한다.
 * body에 position:fixed를 사용하지 않아 BottomNav 등
 * fixed 자식 요소의 위치가 깨지지 않는다.
 *
 * @param active - false를 전달하면 스크롤 잠금을 건너뛴다 (조건부 사용).
 */
export function useScrollLock(active = true): void {
  useEffect(() => {
    if (!active) return;

    const { body } = document;
    const html = document.documentElement;

    const saved = {
      bodyOverflow: body.style.overflow,
      htmlOverflow: html.style.overflow,
      overscroll: body.style.overscrollBehavior,
    };

    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';

    // iOS Safari에서 overflow:hidden만으로는 스크롤 차단이 안 되므로
    // touchmove 이벤트를 직접 막는다.
    // 단, 모달/시트 내부 스크롤 영역은 허용한다.
    const preventScroll = (e: TouchEvent): void => {
      let el = e.target as HTMLElement | null;
      while (el && el !== body) {
        const { overflowY } = window.getComputedStyle(el);
        if (
          (overflowY === 'auto' || overflowY === 'scroll') &&
          el.scrollHeight > el.clientHeight
        ) {
          return;
        }
        el = el.parentElement;
      }
      e.preventDefault();
    };

    document.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      body.style.overflow = saved.bodyOverflow;
      html.style.overflow = saved.htmlOverflow;
      body.style.overscrollBehavior = saved.overscroll;
      document.removeEventListener('touchmove', preventScroll);
    };
  }, [active]);
}
