// Service Worker dla aplikacji mObywatel PWA
const CACHE_NAME = 'mobywatel-pwa-v9';
const PRECACHE = [
  '/',
  '/index.html',
  '/style.css?v=38',
  '/core.js?v=38',
  '/accessibility.js?v=38',
  '/osoby.js?v=38',
  '/variants.js?v=38',
  '/scenarios.js?v=38',
  '/agent.js?v=38',
  '/uslugi.js?v=38',
  '/weryfikacja.js?v=38',
  '/poczta.js?v=38',
  '/ikp-integracja.js?v=38',
  '/mandaty.js?v=38',
  '/powiadomienia-eksport.js?v=38',
  '/katalog-kart.js?v=38',
  '/spotlight.js?v=38',
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
