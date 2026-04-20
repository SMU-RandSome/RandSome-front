import React, { useCallback } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Footer } from '@/components/layout/Footer';
import { Heart, LogOut, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

const MEMBER_TABS = [
  { label: '홈', path: '/home' },
  { label: '매칭', path: '/match' },
  { label: '출석', path: '/attendance' },
  { label: '신청내역', path: '/requests' },
  { label: '마이', path: '/mypage' },
] as const;

export const WebShell: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const isAuthPage = ['/login', '/signup'].includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin');
  const isMemberPage = isAuthenticated && !isAdminPage;

  const handleLogout = useCallback((): void => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  return (
    <div className="min-h-screen mesh-surface flex flex-col">
      {/* 글래스 모피즘 네비게이션 */}
      {!isAdminPage && (
        <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/30 shadow-[0_1px_3px_rgba(0,0,0,0.04)] h-16">
        <div className="max-w-4xl mx-auto h-full px-6 flex items-center justify-between w-full">
          {/* 로고 */}
          <button
            onClick={() => navigate(isAuthenticated ? (isAdminPage ? '/admin' : '/home') : '/')}
            className="flex items-center gap-2.5 group"
            aria-label="홈으로 이동"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-300/30 group-hover:shadow-blue-300/50 transition-shadow duration-300">
              <Heart size={18} fill="currentColor" />
            </div>
            <span className="font-display text-2xl tracking-tight">
              <span className="text-blue-600">Rand</span><span className="text-pink-500">some</span>
            </span>
          </button>

          {/* 회원 탭 — motion layoutId로 부드러운 전환 */}
          {isMemberPage && (
            <nav className="flex items-center gap-0.5 bg-slate-100/60 rounded-xl p-1" aria-label="주요 메뉴">
              {MEMBER_TABS.map((tab) => {
                const isActive =
                  location.pathname === tab.path ||
                  (tab.path === '/requests' &&
                    location.pathname.startsWith('/requests'));
                return (
                  <button
                    key={tab.path}
                    onClick={() => navigate(tab.path)}
                    className="relative px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-200"
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="webActiveTab"
                        className="absolute inset-0 bg-white rounded-lg shadow-sm"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <span className={`relative z-10 transition-colors duration-200 ${
                      isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-700'
                    }`}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* 관리자 탭 */}
          {isAdminPage && (
            <div className="flex items-center gap-2 text-slate-500">
              <ShieldCheck size={18} className="text-slate-700" />
              <span className="text-sm font-bold text-slate-700">관리자 모드</span>
            </div>
          )}

          {/* 우측: 인증 액션 */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-slate-200/60">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {user?.nickname[0]}
                  </div>
                  <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
                    {user?.nickname}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors duration-200"
                >
                  <LogOut size={15} />
                  <span className="hidden sm:inline">로그아웃</span>
                </button>
              </>
            ) : (
              !isAuthPage && (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                    로그인
                  </Button>
                  <Button size="sm" onClick={() => navigate('/signup')}>
                    회원가입
                  </Button>
                </div>
              )
            )}
          </div>
        </div>
      </header>
      )}

      {/* 페이지 컨텐츠 */}
      <main className={`flex-1 ${isAdminPage ? '' : 'mt-16'}`}>
        <Outlet />
      </main>

      {!isAdminPage && <Footer />}
    </div>
  );
};
