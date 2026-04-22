import type { FirebaseApp } from 'firebase/app';
import type { Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

let appInstance: FirebaseApp | null = null;

export const getFirebaseApp = async (): Promise<FirebaseApp> => {
  if (!appInstance) {
    const { initializeApp } = await import('firebase/app');
    appInstance = initializeApp(firebaseConfig);
  }
  return appInstance;
};

export const getFirebaseMessaging = async (): Promise<Messaging | null> => {
  const { isSupported, getMessaging } = await import('firebase/messaging');
  const supported = await isSupported();
  if (!supported) return null;
  const app = await getFirebaseApp();
  return getMessaging(app);
};
