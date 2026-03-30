import React from 'react';
import { useDisplayMode } from '@/store/displayModeStore';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children, className = '' }) => {
  const { isPWA } = useDisplayMode();

  if (isPWA) {
    return (
      <div className="min-h-screen mesh-surface flex justify-center items-start font-sans text-slate-900">
        <div
          className={`w-full max-w-[430px] min-h-screen bg-[#F8FAFF] shadow-[0_0_40px_rgba(0,0,0,0.08)] relative flex flex-col border-x border-slate-200/40 overflow-x-hidden ${className}`}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-[#F8FAFF]">
      <div className={`max-w-4xl mx-auto px-6 py-6 flex flex-col ${className}`}>
        {children}
      </div>
    </div>
  );
};
