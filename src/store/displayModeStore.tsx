import React, { createContext, useContext, useMemo } from 'react';
import { useIsPWA } from '@/hooks/useIsPWA';

interface DisplayModeContextType {
  isPWA: boolean;
  isStandalone: boolean;
}

const DisplayModeContext = createContext<DisplayModeContextType>({ isPWA: false, isStandalone: false });

export const DisplayModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isPWA, isStandalone } = useIsPWA();
  const value = useMemo(() => ({ isPWA, isStandalone }), [isPWA, isStandalone]);

  return (
    <DisplayModeContext.Provider value={value}>
      {children}
    </DisplayModeContext.Provider>
  );
};

export const useDisplayMode = (): DisplayModeContextType => useContext(DisplayModeContext);
