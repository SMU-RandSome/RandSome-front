import { useEffect } from 'react';
import { getFirebaseMessaging } from '@/lib/firebase';
import { syncDeviceToken, deleteDeviceToken } from '@/features/member/api';

export const FCM_TOKEN_KEY = 'fcmToken';
export const FCM_ENABLED_KEY = 'fcmEnabled';
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;

// 동시에 여러 syncDeviceToken 호출이 발생하지 않도록 in-flight 가드
let syncInFlight = false;

/** 로그인 시 권한이 이미 허용된 경우 자동으로 토큰을 동기화한다. */
export const useFcmToken = (isAuthenticated: boolean): void => {
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!VAPID_KEY) return;
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;
    if (localStorage.getItem(FCM_ENABLED_KEY) !== 'true') return;

    registerFcmToken().catch((err) => {
      if (import.meta.env.DEV) console.error('FCM 토큰 자동 등록 실패:', err);
    });
  }, [isAuthenticated]);
};

/** 알림 허용 토글 ON: 권한 요청 → 토큰 발급 → 서버 동기화 */
export const registerFcmToken = async (): Promise<boolean> => {
  if (!VAPID_KEY || typeof Notification === 'undefined') return false;

  const messaging = await getFirebaseMessaging();
  if (!messaging) return false;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  const { getToken } = await import('firebase/messaging');
  const token = await getToken(messaging, { vapidKey: VAPID_KEY });
  if (!token) return false;

  const cached = localStorage.getItem(FCM_TOKEN_KEY);
  if (cached !== token) {
    if (syncInFlight) return false;
    syncInFlight = true;
    try {
      await syncDeviceToken({ deviceToken: token });
      localStorage.setItem(FCM_TOKEN_KEY, token);
    } catch (err) {
      if (import.meta.env.DEV) console.error('FCM 토큰 서버 동기화 실패:', err);
      return false;
    } finally {
      syncInFlight = false;
    }
  }
  localStorage.setItem(FCM_ENABLED_KEY, 'true');

  return true;
};

/** 알림 허용 토글 OFF: Firebase 토큰 삭제 → 서버 삭제 → 캐시 제거 */
export const unregisterFcmToken = async (): Promise<void> => {
  const token = localStorage.getItem(FCM_TOKEN_KEY);
  const messaging = await getFirebaseMessaging();
  if (messaging) {
    const { deleteToken } = await import('firebase/messaging');
    await deleteToken(messaging).catch((err) => {
      if (import.meta.env.DEV) console.error('Firebase 토큰 삭제 실패:', err);
    });
  }
  if (token) {
    await deleteDeviceToken(token).catch((err) => {
      if (import.meta.env.DEV) console.error('서버 FCM 토큰 삭제 실패:', err);
    });
  }
  localStorage.removeItem(FCM_TOKEN_KEY);
  localStorage.removeItem(FCM_ENABLED_KEY);
};

/** 로그아웃 시 호출 — 서버 API 없이 로컬 캐시만 제거 */
export const clearFcmToken = (): void => {
  localStorage.removeItem(FCM_TOKEN_KEY);
};
