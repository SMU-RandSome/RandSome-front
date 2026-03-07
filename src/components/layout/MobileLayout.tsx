import React from 'react';
import { useDisplayMode } from '@/store/displayModeStore';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children, className = '' }) => {
  const { isPWA } = useDisplayMode();

  if (isPWA) {
    // PWA(standalone): 430px 모바일 프레임
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-start font-sans text-slate-900">
        <div
          className={`w-full max-w-[430px] min-h-screen bg-slate-50 shadow-2xl relative flex flex-col border-x border-slate-200 ${className}`}
        >
          {children}
        </div>
      </div>
    );
  }

  // 웹 브라우저: 최대 너비 제한 + 중앙 정렬
  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className={`max-w-4xl mx-auto px-6 py-6 flex flex-col ${className}`}>
        {children}
      </div>
    </div>
  );
};
