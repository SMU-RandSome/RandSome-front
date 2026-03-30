importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyB2QPQ9wLoIbW9HjnQ-aGhqF-6gyACHMJk',
  authDomain: 'randsome-8a530.firebaseapp.com',
  projectId: 'randsome-8a530',
  storageBucket: 'randsome-8a530.firebasestorage.app',
  messagingSenderId: '301164368239',
  appId: '1:301164368239:web:47a16bcef522df385f189a',
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
  const url = event.notification.data?.url ?? '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    }),
  );
});
