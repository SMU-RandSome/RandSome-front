import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Heart, FileText, User } from 'lucide-react';
import { useDisplayMode } from '@/store/displayModeStore';

const TABS = [
  { id: 'home', label: '홈', icon: Sparkles, path: '/home' },
  { id: 'match', label: '매칭', icon: Heart, path: '/match' },
  { id: 'requests', label: '신청내역', icon: FileText, path: '/requests' },
  { id: 'mypage', label: '마이', icon: User, path: '/mypage' },
] as const;

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isPWA } = useDisplayMode();

  // 웹 모드에서는 WebShell 상단 네비게이션이 담당
  if (!isPWA) return null;

  return (
    <nav className="fixed bottom-0 w-full max-w-[430px] bg-white border-t border-slate-200 h-16 px-6 flex items-center justify-between z-50 left-1/2 -translate-x-1/2">
      {TABS.map((tab) => {
        const isActive = location.pathname === tab.path;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`}
            aria-label={tab.label}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
