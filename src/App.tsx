import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { DisplayModeProvider } from '@/store/displayModeStore';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { router } from '@/router';

function NotificationPermissionRequester() {
  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'default') return;
    const timer = setTimeout(() => {
      Notification.requestPermission().catch(() => {});
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <DisplayModeProvider>
          <NotificationPermissionRequester />
          <RouterProvider router={router} />
        </DisplayModeProvider>
      </MotionConfig>
    </ErrorBoundary>
  );
}
