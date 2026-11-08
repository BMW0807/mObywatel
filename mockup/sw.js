// Service Worker dla aplikacji mObywatel PWA
const CACHE_NAME = 'mobywatel-pwa-v8';
const PRECACHE = [
  '/',
  '/index.html',
  '/style.css?v=37',
  '/core.js?v=37',
  '/accessibility.js?v=37',
  '/osoby.js?v=37',
  '/variants.js?v=37',
  '/scenarios.js?v=37',
  '/agent.js?v=37',
  '/uslugi.js?v=37',
  '/weryfikacja.js?v=37',
  '/poczta.js?v=37',
  '/ikp-integracja.js?v=37',
  '/manifest.json',
  '/assets/icon-mobywatel.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE).catch(() => {});
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then(response => {
      if (response && response.status === 200) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => caches.match(event.request))
  );
});
