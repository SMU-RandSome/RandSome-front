import { useEffect, useState } from 'react';

export interface DisplayModeState {
  isPWA: boolean;        // 모바일 레이아웃 사용 여부 (좁은 뷰포트 OR standalone)
  isStandalone: boolean; // 실제 PWA standalone 여부만
}

const computeState = (): DisplayModeState => {
  if (typeof window === 'undefined') return { isPWA: false, isStandalone: false };
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;
  return { isPWA: isStandalone || isMobileViewport, isStandalone };
};

export const useIsPWA = (): DisplayModeState => {
  const [state, setState] = useState<DisplayModeState>(computeState);

  useEffect(() => {
    const standaloneMedia = window.matchMedia('(display-mode: standalone)');
    const mobileMedia = window.matchMedia('(max-width: 768px)');
    const handler = (): void => setState(computeState());
    standaloneMedia.addEventListener('change', handler);
    mobileMedia.addEventListener('change', handler);
    return () => {
      standaloneMedia.removeEventListener('change', handler);
      mobileMedia.removeEventListener('change', handler);
    };
  }, []);

  return state;
};
