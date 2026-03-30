import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
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
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <DisplayModeProvider>
          <AuthProvider>
            <ToastProvider>
              <FcmInitializer />
              <RouterProvider router={router} />
            </ToastProvider>
          </AuthProvider>
        </DisplayModeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
