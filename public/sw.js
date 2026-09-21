const CACHE_NAME = 'voidtube-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Let Invidious API and video stream requests pass through network directly
  if (event.request.url.includes('/api/') || event.request.url.includes('googlevideo.com') || event.request.url.includes('ytimg.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Network first with cache fallback for HTML navigation
      if (event.request.mode === 'navigate') {
        return fetch(event.request).catch(() => cached || caches.match('/'));
      }
      return cached || fetch(event.request).catch(() => cached);
    })
  );
});

// Listen for message to skip waiting for instant OTA update
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
