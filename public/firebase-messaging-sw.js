importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: '__VITE_FIREBASE_API_KEY__',
  authDomain: '__VITE_FIREBASE_AUTH_DOMAIN__',
  projectId: '__VITE_FIREBASE_PROJECT_ID__',
  storageBucket: '__VITE_FIREBASE_STORAGE_BUCKET__',
  messagingSenderId: '__VITE_FIREBASE_MESSAGING_SENDER_ID__',
  appId: '__VITE_FIREBASE_APP_ID__',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  // 앱이 포그라운드(visible)면 onMessage �핸들러가 Toast로 처리하므로 시스템 알림 생략
  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
    const isVisible = clientList.some((c) => c.visibilityState === 'visible');
    if (isVisible) return;

    const title = payload.notification?.title ?? 'Randsome';
    const body = payload.notification?.body ?? '';
    self.registration.showNotification(title, {
      body,
      icon: '/vite.svg',
      badge: '/vite.svg',
      data: payload.data,
    });
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  var raw = event.notification.data?.url ?? '/';
  var url = '/';
  try {
    var parsed = new URL(raw, self.location.origin);
    if (parsed.origin === self.location.origin) {
      url = parsed.pathname + parsed.search + parsed.hash;
    }
  } catch (e) {
    // malformed URL — fallback to root
  }
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    }),
  );
});
