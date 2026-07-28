/* Calm Mama Village — baseline PWA service worker (cache + web push). */
/* Bump CACHE_NAME on every release that must reach installed PWAs. */
const CACHE_NAME = 'calmmama-village-static-v21';
const CORE_ASSETS = [
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS).catch(() => undefined))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never serve stale HTML / app shell from Cache Storage after a deploy.
  if (request.mode === 'navigate' || url.pathname === '/' || url.pathname === '/index.html' || url.pathname === '/app') {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then((response) => response)
        .catch(() => caches.match('/index.html')),
    );
    return;
  }

  // Network-first for JS bundles so deploys reach installed PWAs quickly.
  if (url.pathname.endsWith('.js') || url.pathname.includes('/_expo/')) {
    event.respondWith(
      fetch(request, { cache: 'no-store' }).catch(() =>
        caches.match(request).then((cached) => cached || caches.match('/index.html')),
      ),
    );
    return;
  }

  // Never cache the service worker itself.
  if (url.pathname === '/sw.js') {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }

  // Cache-first for icons / manifest / static shell assets.
  if (
    CORE_ASSETS.includes(url.pathname) ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.ico') ||
    url.pathname === '/manifest.json'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => undefined);
          return response;
        });
      }),
    );
  }
});

self.addEventListener('push', (event) => {
  let payload = {
    title: 'Calm Mama Village',
    body: 'A soft note from your village is waiting.',
    url: '/',
    icon: '/logo192.png',
    badge: '/logo192.png',
  };

  try {
    if (event.data) {
      const data = event.data.json ? event.data.json() : null;
      if (data && typeof data === 'object') {
        payload = {
          ...payload,
          title: data.title || payload.title,
          body: data.body || data.message || payload.body,
          url: data.url || data.route || payload.url,
          icon: data.icon || payload.icon,
          badge: data.badge || payload.badge,
          tag: data.tag || 'calmmama-village',
        };
      } else {
        const text = event.data.text?.() || String(event.data);
        if (text) payload.body = text;
      }
    }
  } catch (_) {
    try {
      const text = event.data?.text?.();
      if (text) payload.body = text;
    } catch (__) {
      /* keep defaults */
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      badge: payload.badge,
      tag: payload.tag || 'calmmama-village',
      renotify: true,
      data: { url: payload.url },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      for (const client of clientsArr) {
        if ('focus' in client) {
          client.focus();
          if (client.navigate && targetUrl) {
            try {
              client.navigate(targetUrl);
            } catch (_) {
              /* ignore */
            }
          }
          return undefined;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return undefined;
    }),
  );
});
