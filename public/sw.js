const CACHE_NAME = 'tips-diaris-v1';
const OFFLINE_URLS = ['/', '/index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/index.html')
      )
    );
  }
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'Tips Diaris', body: event.data ? event.data.text() : 'Nou tip disponible!' };
  }

  const title = data.title || 'Tips Diaris';
  const options = {
    body: data.body || 'Tens un nou tip per avui!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'daily-tip',
    renotify: true,
    data: {
      url: data.url || '/',
      tip: data.body || '',
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const tipEncoded = encodeURIComponent(event.notification.data.tip || '');
  const url = tipEncoded ? `/?tip=${tipEncoded}` : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
