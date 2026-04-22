import { useEffect, useRef } from 'react';
import { getFirebaseMessaging } from '@/lib/firebase';
import { useToast } from '@/components/ui/Toast';

export const useFcmMessages = (): void => {
  const { toast } = useToast();
  const toastRef = useRef(toast);

  useEffect(() => {
    toastRef.current = toast;
  });

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    const setup = async (): Promise<void> => {
      const messaging = await getFirebaseMessaging();
      if (cancelled || !messaging) return;

      const { onMessage } = await import('firebase/messaging');
      unsubscribe = onMessage(messaging, (payload) => {
        const title = payload.notification?.title ?? 'Randsome';
        const body = payload.notification?.body ?? '';
        toastRef.current(`[${title}] ${body}`, 'info');
      });
    };

    setup().catch(() => {});
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);
};
