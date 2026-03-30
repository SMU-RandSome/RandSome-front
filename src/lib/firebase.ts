import { initializeApp } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';
import type { Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyB2QPQ9wLoIbW9HjnQ-aGhqF-6gyACHMJk',
  authDomain: 'randsome-8a530.firebaseapp.com',
  projectId: 'randsome-8a530',
  storageBucket: 'randsome-8a530.firebasestorage.app',
  messagingSenderId: '301164368239',
  appId: '1:301164368239:web:47a16bcef522df385f189a',
};

const app = initializeApp(firebaseConfig);

export const getFirebaseMessaging = async (): Promise<Messaging | null> => {
  const supported = await isSupported();
  if (!supported) return null;
  return getMessaging(app);
};
