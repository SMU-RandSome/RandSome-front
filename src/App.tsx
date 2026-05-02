import { RouterProvider } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { DisplayModeProvider } from '@/store/displayModeStore';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { router } from '@/router';

export default function App() {
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <DisplayModeProvider>
          <RouterProvider router={router} />
        </DisplayModeProvider>
      </MotionConfig>
    </ErrorBoundary>
  );
}
