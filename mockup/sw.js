// Service Worker dla aplikacji mObywatel PWA
const CACHE_NAME = 'mobywatel-pwa-v6';
const PRECACHE = [
  '/',
  '/index.html',
  '/style.css?v=35',
  '/core.js?v=35',
  '/accessibility.js?v=35',
  '/osoby.js?v=35',
  '/variants.js?v=35',
  '/scenarios.js?v=35',
  '/agent.js?v=35',
  '/uslugi.js?v=35',
  '/weryfikacja.js?v=35',
  '/poczta.js?v=35',
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
  // Network first dla API i statyków z fallbackiem do cache
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
