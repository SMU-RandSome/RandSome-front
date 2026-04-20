import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, Heart, FileText, User, CalendarCheck } from 'lucide-react';
import { useDisplayMode } from '@/store/displayModeStore';

const TABS = [
  { id: 'home', label: '홈', icon: Heart, path: '/home', activeColor: '#ec4899' },
  { id: 'match', label: '매칭', icon: Sparkles, path: '/match', activeColor: '#2563eb' },
  { id: 'attendance', label: '출석', icon: CalendarCheck, path: '/attendance', activeColor: '#2563eb' },
  { id: 'requests', label: '신청내역', icon: FileText, path: '/requests', activeColor: '#2563eb' },
  { id: 'mypage', label: '마이', icon: User, path: '/mypage', activeColor: '#2563eb' },
] as const;

export const BottomNav: React.FC = () => {
  const { isPWA } = useDisplayMode();

  if (!isPWA) return null;

  return (
    <nav
      className="fixed bottom-0 w-full max-w-[430px] z-50 left-1/2 -translate-x-1/2 flex items-center justify-around px-4"
      style={{
        height: 76,
        paddingBottom: 28,
        paddingTop: 8,
        background: 'rgba(255,255,255,.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(219,234,254,.7)',
      }}
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;

        return (
          <NavLink
            key={tab.id}
            to={tab.path}
            aria-label={tab.label}
            className="relative flex flex-col items-center gap-[3px]"
          >
            {({ isActive }) => {
              const ac = tab.activeColor;
              const ic = '#94a3b8';
              const fillHome = isActive && tab.id === 'home';
              const fillMatch = isActive && tab.id === 'match';

              return (
                <div
                  className="flex flex-col items-center gap-[3px] px-3 py-[7px] rounded-2xl transition-all duration-200"
                  style={{
                    background: isActive
                      ? tab.id === 'home'
                        ? 'rgba(236,72,153,.18)'
                        : 'rgba(37,99,235,.18)'
                      : 'transparent',
                  }}
                >
                  <Icon
                    size={21}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    fill={fillHome || fillMatch ? 'currentColor' : 'none'}
                    className="transition-colors duration-200"
                    style={{ color: isActive ? ac : ic }}
                  />
                  <span
                    className="text-[10px] transition-colors duration-200"
                    style={{ fontWeight: isActive ? 700 : 500, color: isActive ? ac : ic }}
                  >
                    {tab.label}
                  </span>
                </div>
              );
            }}
          </NavLink>
        );
      })}
    </nav>
  );
};
