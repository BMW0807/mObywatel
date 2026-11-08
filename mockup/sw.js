// Service Worker dla aplikacji mObywatel PWA
const CACHE_NAME = 'mobywatel-pwa-v12';
const PRECACHE = [
  '/',
  '/index.html',
  '/style.css?v=42',
  '/core.js?v=42',
  '/accessibility.js?v=42',
  '/osoby.js?v=42',
  '/variants.js?v=42',
  '/scenarios.js?v=42',
  '/agent.js?v=42',
  '/uslugi.js?v=42',
  '/weryfikacja.js?v=42',
  '/poczta.js?v=42',
  '/ikp-integracja.js?v=42',
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
