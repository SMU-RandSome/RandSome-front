import { useEffect } from 'react';

/**
 * body 스크롤을 잠그는 훅.
 * iOS Safari에서 position:fixed + touch-action:none 조합으로
 * 배경 스크롤과 러버밴드 바운스를 차단한다.
 *
 * @param active - false를 전달하면 스크롤 잠금을 건너뛴다 (조건부 사용).
 */
export function useScrollLock(active = true): void {
  useEffect(() => {
    if (!active) return;

    const scrollY = window.scrollY;
    const { body } = document;
    const html = document.documentElement;

    const originalBodyOverflow = body.style.overflow;
    const originalHtmlOverflow = html.style.overflow;
    const originalBodyPosition = body.style.position;
    const originalBodyTop = body.style.top;
    const originalBodyWidth = body.style.width;
    const originalTouchAction = body.style.touchAction;
    const originalOverscroll = body.style.overscrollBehavior;

    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.touchAction = 'none';
    body.style.overscrollBehavior = 'none';

    return () => {
      body.style.overflow = originalBodyOverflow;
      html.style.overflow = originalHtmlOverflow;
      body.style.position = originalBodyPosition;
      body.style.top = originalBodyTop;
      body.style.width = originalBodyWidth;
      body.style.touchAction = originalTouchAction;
      body.style.overscrollBehavior = originalOverscroll;
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}
