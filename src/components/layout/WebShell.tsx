import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Sparkles, Heart, FileText, User, LogOut, ShieldCheck } from 'lucide-react';

const MEMBER_TABS = [
  { label: '홈', path: '/home', icon: Sparkles },
  { label: '매칭', path: '/match', icon: Heart },
  { label: '신청내역', path: '/requests', icon: FileText },
  { label: '마이페이지', path: '/mypage', icon: User },
] as const;

export const WebShell: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const isAuthPage = ['/login', '/signup'].includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin');
  const isMemberPage = isAuthenticated && !isAdminPage;

  const handleLogout = (): void => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 웹 상단 네비게이션 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16">
        <div className="max-w-4xl mx-auto h-full px-6 flex items-center justify-between w-full">
          {/* 로고 */}
          <button
            onClick={() => navigate(isAuthenticated ? (isAdminPage ? '/admin' : '/home') : '/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            aria-label="홈으로 이동"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-200">
              <Heart size={18} fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-blue-600">Rand</span><span className="text-pink-500">some</span>
            </span>
          </button>

          {/* 회원 탭 네비게이션 */}
          {isMemberPage && (
            <nav className="flex items-center gap-1" aria-label="주요 메뉴">
              {MEMBER_TABS.map((tab) => {
                const isActive =
                  location.pathname === tab.path ||
                  (tab.path === '/requests' &&
                    location.pathname.startsWith('/requests'));
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.path}
                    onClick={() => navigate(tab.path)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
                    {tab.label}
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
                {/* 사용자 정보 */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {user?.nickname[0]}
                  </div>
                  <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
                    {user?.nickname}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-900 transition-colors"
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

      {/* 페이지 컨텐츠: mt-16으로 fixed nav 공간 확보, overflow-y-auto로 sticky 기준 컨테이너 설정 */}
      <main className="flex-1 mt-16 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
