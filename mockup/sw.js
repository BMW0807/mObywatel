// Service Worker dla aplikacji mObywatel PWA
const CACHE_NAME = 'mobywatel-pwa-v13';
const PRECACHE = [
  '/',
  '/index.html',
  '/style.css?v=43',
  '/core.js?v=43',
  '/accessibility.js?v=43',
  '/osoby.js?v=43',
  '/variants.js?v=43',
  '/scenarios.js?v=43',
  '/agent.js?v=43',
  '/uslugi.js?v=43',
  '/weryfikacja.js?v=43',
  '/poczta.js?v=43',
  '/ikp-integracja.js?v=43',
  '/manifest.json',
  '/assets/icon-mobywatel.svg',
  '/assets/card-ikp-v2.svg',
  '/assets/card-firma-v2.svg',
  '/assets/card-emeryt.svg',
  '/assets/card-karta-polaka.svg',
  '/assets/card-nauczyciel.svg',
  '/assets/card-pwz-lekarz.svg',
  '/assets/card-pwz-pielegniarka.svg',
  '/assets/card-legitymacja-szkolna.svg'
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
