import { useEffect, useState } from 'react';

const isMobileOrPWA = (): boolean => {
  if (typeof window === 'undefined') return false;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIOSStandalone =
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;
  return isStandalone || isIOSStandalone || isMobileViewport;
};

export const useIsPWA = (): boolean => {
  const [isPWA, setIsPWA] = useState<boolean>(isMobileOrPWA);

  useEffect(() => {
    const standaloneMedia = window.matchMedia('(display-mode: standalone)');
    const mobileMedia = window.matchMedia('(max-width: 768px)');
    const handler = (): void => setIsPWA(isMobileOrPWA());
    standaloneMedia.addEventListener('change', handler);
    mobileMedia.addEventListener('change', handler);
    return () => {
      standaloneMedia.removeEventListener('change', handler);
      mobileMedia.removeEventListener('change', handler);
    };
  }, []);

  return isPWA;
};
