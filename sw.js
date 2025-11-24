// Simple service worker for offline caching
const CACHE_NAME = 'waktusolat-site-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // cache-first strategy
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request).catch(() => {
      // fallback to index.html for navigation requests (basic SPA)
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    }))
  );
});
