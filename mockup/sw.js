// Service Worker dla aplikacji mObywatel PWA
const CACHE_NAME = 'mobywatel-pwa-v7';
const PRECACHE = [
  '/',
  '/index.html',
  '/style.css?v=36',
  '/core.js?v=36',
  '/accessibility.js?v=36',
  '/osoby.js?v=36',
  '/variants.js?v=36',
  '/scenarios.js?v=36',
  '/agent.js?v=36',
  '/uslugi.js?v=36',
  '/weryfikacja.js?v=36',
  '/poczta.js?v=36',
  '/ikp-integracja.js?v=36',
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
