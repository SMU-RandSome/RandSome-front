import React from 'react';
import { useDisplayMode } from '@/store/displayModeStore';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
  outerClassName?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children, className = '', outerClassName = '' }) => {
  const { isPWA, isStandalone } = useDisplayMode();

  if (isPWA) {
    return (
      <div className={`min-h-screen bg-member flex justify-center items-start font-sans text-slate-900 overflow-x-hidden ${outerClassName}`}>
        <div
          className={`w-full min-h-screen bg-member relative flex flex-col ${isStandalone ? 'max-w-[430px] shadow-[0_0_40px_rgba(0,0,0,0.08)]' : ''} ${className}`}
        >
          {children}
        </div>
      </div>
    );
  }

  // 웹 모드: 배경 full-width, 페이지가 자체적으로 콘텐츠 센터링
  return (
    <div
      className={`w-full bg-member ${className}`}
      style={{ minHeight: 'calc(100vh - 4rem)' }}
    >
      {children}
    </div>
  );
};
