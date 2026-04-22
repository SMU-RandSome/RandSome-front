import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { AuthProvider } from '@/store/authStore';
import { DisplayModeProvider } from '@/store/displayModeStore';
import { ToastProvider } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import FcmInitializer from '@/components/FcmInitializer';
import { router } from '@/router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      gcTime: 1000 * 60 * 30, // 30분 — 축제 기간 캐시 오래 유지
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false, // 10,000명 탭 전환 시 서버 폭주 방지
      networkMode: 'offlineFirst', // 축제장 WiFi 불안정 대비
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <MotionConfig reducedMotion="user">
          <DisplayModeProvider>
            <AuthProvider>
              <ToastProvider>
                <FcmInitializer />
                <RouterProvider router={router} />
              </ToastProvider>
            </AuthProvider>
          </DisplayModeProvider>
        </MotionConfig>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
