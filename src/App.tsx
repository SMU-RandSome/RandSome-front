import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/store/authStore';
import { RequestProvider } from '@/store/requestStore';
import { DisplayModeProvider } from '@/store/displayModeStore';
import { ToastProvider } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
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
            <RequestProvider>
              <ToastProvider>
                <RouterProvider router={router} />
              </ToastProvider>
            </RequestProvider>
          </AuthProvider>
        </DisplayModeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
