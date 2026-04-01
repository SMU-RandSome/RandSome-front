import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, Heart, FileText, User } from 'lucide-react';
import { useDisplayMode } from '@/store/displayModeStore';
import { motion } from 'motion/react';

const TABS = [
  { id: 'home', label: '홈', icon: Sparkles, path: '/home' },
  { id: 'match', label: '매칭', icon: Heart, path: '/match' },
  { id: 'requests', label: '신청내역', icon: FileText, path: '/requests' },
  { id: 'mypage', label: '마이', icon: User, path: '/mypage' },
] as const;

export const BottomNav: React.FC = () => {
  const { isPWA } = useDisplayMode();

  if (!isPWA) return null;

  return (
    <nav className="fixed bottom-0 w-full max-w-[430px] glass border-t border-white/30 shadow-[0_-1px_3px_rgba(0,0,0,0.03)] h-16 px-4 flex items-center justify-around z-50 left-1/2 -translate-x-1/2 safe-area-pb">
      {TABS.map((tab) => {
        const Icon = tab.icon;

        return (
          // NavLink: 시맨틱 앵커 → 우클릭·중간클릭으로 새 탭 열기 가능 (UX 개선)
          <NavLink
            key={tab.id}
            to={tab.path}
            aria-label={tab.label}
            className="relative flex flex-col items-center gap-0.5 py-1 px-3"
          >
            {({ isActive }) => (
              <>
                <div className="relative p-2 rounded-xl">
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavPill"
                      className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-300/30"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className={`relative z-10 transition-colors duration-200 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                </div>
                <span
                  className={`text-[9px] font-semibold transition-colors duration-200 ${
                    isActive ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};
