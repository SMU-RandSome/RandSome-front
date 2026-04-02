import { useEffect } from 'react';
import { getToken, deleteToken } from 'firebase/messaging';
import { getFirebaseMessaging } from '@/lib/firebase';
import { syncDeviceToken, deleteDeviceToken } from '@/features/notification/api';

export const FCM_TOKEN_KEY = 'fcmToken';
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;

/** 로그인 시 권한이 이미 허용된 경우 자동으로 토큰을 동기화한다. */
export const useFcmToken = (isAuthenticated: boolean): void => {
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!VAPID_KEY) return;
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;
    if (!localStorage.getItem(FCM_TOKEN_KEY)) return; // 토글 OFF 상태면 자동 등록 생략

    registerFcmToken().catch(() => {});
  }, [isAuthenticated]);
};

/** 알림 허용 토글 ON: 권한 요청 → 토큰 발급 → 서버 동기화 */
export const registerFcmToken = async (): Promise<boolean> => {
  if (!VAPID_KEY || typeof Notification === 'undefined') return false;

  const messaging = await getFirebaseMessaging();
  if (!messaging) return false;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  const token = await getToken(messaging, { vapidKey: VAPID_KEY });
  if (!token) return false;

  const cached = localStorage.getItem(FCM_TOKEN_KEY);
  if (cached !== token) {
    await syncDeviceToken({ deviceToken: token });
    localStorage.setItem(FCM_TOKEN_KEY, token);
  }

  return true;
};

/** 알림 허용 토글 OFF: Firebase 토큰 삭제 → 서버 삭제 → 캐시 제거 */
export const unregisterFcmToken = async (): Promise<void> => {
  const token = localStorage.getItem(FCM_TOKEN_KEY);
  const messaging = await getFirebaseMessaging();
  if (messaging) {
    await deleteToken(messaging).catch(() => {});
  }
  if (token) {
    await deleteDeviceToken(token).catch(() => {});
  }
  localStorage.removeItem(FCM_TOKEN_KEY);
};

/** 로그아웃 시 호출 — 서버 API 없이 로컬 캐시만 제거 */
export const clearFcmToken = (): void => {
  localStorage.removeItem(FCM_TOKEN_KEY);
};
