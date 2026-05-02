import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { WebShell } from '@/components/layout/WebShell';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useDisplayMode } from '@/store/displayModeStore';

const GuestMainPage = React.lazy(() => import('@/pages/GuestMainPage'));
const AboutPage = React.lazy(() => import('@/pages/AboutPage'));
const GuidePage = React.lazy(() => import('@/pages/GuidePage'));

const PageLoader: React.FC = () => (
  <div className="min-h-screen mesh-surface flex justify-center items-start">
    <div className="w-full max-w-2xl min-h-screen bg-member flex items-center justify-center border-x border-slate-200/40">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
    </div>
  </div>
);

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

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <WebShell />
      </Suspense>
    </ErrorBoundary>
  );
};

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <GuestMainPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/guide', element: <GuidePage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
