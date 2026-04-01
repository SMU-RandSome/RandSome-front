import React, { createContext, useContext, useMemo } from 'react';
import { useIsPWA } from '@/hooks/useIsPWA';

interface DisplayModeContextType {
  isPWA: boolean;
}

const DisplayModeContext = createContext<DisplayModeContextType>({ isPWA: false });

export const DisplayModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isPWA = useIsPWA();
  // isPWA가 변경될 때만 새 객체 생성 — 모든 useDisplayMode() 소비자 불필요 리렌더링 방지
  const value = useMemo(() => ({ isPWA }), [isPWA]);

  return (
    <DisplayModeContext.Provider value={value}>
      {children}
    </DisplayModeContext.Provider>
  );
};

export const useDisplayMode = (): DisplayModeContextType => useContext(DisplayModeContext);
