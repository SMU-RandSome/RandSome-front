import React, { createContext, useContext } from 'react';
import { useIsPWA } from '@/hooks/useIsPWA';

interface DisplayModeContextType {
  isPWA: boolean;
}

const DisplayModeContext = createContext<DisplayModeContextType>({ isPWA: false });

export const DisplayModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isPWA = useIsPWA();

  return (
    <DisplayModeContext.Provider value={{ isPWA }}>
      {children}
    </DisplayModeContext.Provider>
  );
};

export const useDisplayMode = (): DisplayModeContextType => useContext(DisplayModeContext);
