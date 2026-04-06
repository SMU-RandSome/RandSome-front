import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/store/authStore';
import { useDisplayMode } from '@/store/displayModeStore';
import { WebShell } from '@/components/layout/WebShell';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// 라우트 단위 코드 스플리팅
const GuestMainPage = React.lazy(() => import('@/pages/GuestMainPage'));
const LoginPage = React.lazy(() => import('@/pages/LoginPage'));
const SignupPage = React.lazy(() => import('@/pages/SignupPage'));
const ForgotPasswordPage = React.lazy(() => import('@/pages/ForgotPasswordPage'));
const MemberMainPage = React.lazy(() => import('@/pages/MemberMainPage'));
const MatchPage = React.lazy(() => import('@/pages/MatchPage'));
const RequestsPage = React.lazy(() => import('@/pages/RequestsPage'));
const MatchRequestDetailPage = React.lazy(() => import('@/pages/MatchRequestDetailPage'));
const MyPage = React.lazy(() => import('@/pages/MyPage'));
const AdminDashboard = React.lazy(() => import('@/pages/admin/AdminDashboard'));

const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-gray-100 flex justify-center items-start">
    <div className="w-full max-w-[430px] min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
    </div>
  </div>
);

/** PWA면 Outlet 직접, 웹이면 WebShell(상단 nav) 로 감싸는 최상위 레이아웃 */
const AppShell: React.FC = () => {
  const { isPWA } = useDisplayMode();

  if (isPWA) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
    );
  }

  // 웹 모드: WebShell이 내부에서 <Outlet /> 렌더링
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <WebShell />
      </Suspense>
    </ErrorBoundary>
  );
};

/** 루트('/') 진입 시 인증 상태에 따라 리다이렉트 */
const RootRoute: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated || !user) return <GuestMainPage />;
  if (user.role === 'ROLE_ADMIN') return <Navigate to="/admin" replace />;
  return <Navigate to="/home" replace />;
};

/** 인증된 회원만 접근 가능한 라우트 */
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated || !user) return <Navigate to="/" replace />;
  if (user.role === 'ROLE_ADMIN') return <Navigate to="/admin" replace />;
  return <Outlet />;
};

/** 관리자만 접근 가능한 라우트 */
const AdminRoute: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated || !user) return <Navigate to="/" replace />;
  if (user.role !== 'ROLE_ADMIN') return <Navigate to="/home" replace />;
  return <Outlet />;
};

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      // 공개 라우트
      { path: '/', element: <RootRoute /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },

      // 회원 전용 라우트
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/home', element: <MemberMainPage /> },
          { path: '/match', element: <MatchPage /> },
          { path: '/requests', element: <RequestsPage /> },
          { path: '/requests/detail', element: <MatchRequestDetailPage /> },
          { path: '/mypage', element: <MyPage /> },
        ],
      },

      // 관리자 전용 라우트
      {
        element: <AdminRoute />,
        children: [{ path: '/admin', element: <AdminDashboard /> }],
      },

      // 404
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
