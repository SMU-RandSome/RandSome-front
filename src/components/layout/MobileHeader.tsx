import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useDisplayMode } from '@/store/displayModeStore';

interface MobileHeaderProps {
  /** 왼쪽 타이틀 텍스트. brand가 true이면 무시됨 */
  title?: string;
  /** true면 Logo + Randsome 브랜드로 표시 */
  brand?: boolean;
  /** 제공 시 왼쪽에 뒤로가기 버튼 표시 */
  onBack?: () => void;
  /** 우측 슬롯 */
  right?: React.ReactNode;
}

const HEADER_STYLE: React.CSSProperties = {
  background: 'rgba(237,243,255,.9)',
  backdropFilter: 'blur(24px)',
};

export const MobileHeader: React.FC<MobileHeaderProps> = ({ title, brand, onBack, right }) => {
  const { isPWA } = useDisplayMode();

  // 웹 모드: WebShell이 상단 네비게이션을 담당하므로 MobileHeader 숨김
  if (!isPWA) return null;

  return (
    <header
      className="sticky top-0 z-50 px-4 h-14 flex items-center gap-3 border-b border-blue-500/10"
      style={HEADER_STYLE}
    >
      {onBack && (
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(255,255,255,.7)', border: '1px solid rgba(59,130,246,.1)' }}
          aria-label="뒤로 가기"
        >
          <ChevronLeft size={18} className="text-slate-600" />
        </button>
      )}

      <div className="flex-1 flex items-center gap-2.5 min-w-0">
        {brand ? (
          <>
            <Logo />
            <span className="font-display text-[22px] tracking-tight leading-none">
              <span className="text-blue-700">Rand</span>
              <span className="text-pink-500">some</span>
            </span>
          </>
        ) : (
          <h1 className="text-[17px] font-bold text-slate-900 truncate">{title}</h1>
        )}
      </div>

      {right && <div className="shrink-0">{right}</div>}
    </header>
  );
};
