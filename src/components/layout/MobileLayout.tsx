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
      <div className="min-h-screen bg-member flex justify-center items-start font-sans text-slate-900">
        <div
          className={`w-full max-w-[430px] min-h-screen bg-member shadow-[0_0_40px_rgba(0,0,0,0.08)] relative flex flex-col border-x border-slate-200/40 overflow-x-hidden ${className}`}
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
