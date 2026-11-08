// Service Worker dla aplikacji mObywatel PWA
const CACHE_NAME = 'mobywatel-pwa-v2';
const PRECACHE = [
  '/',
  '/index.html',
  '/style.css?v=31',
  '/core.js?v=31',
  '/accessibility.js?v=31',
  '/osoby.js?v=31',
  '/variants.js?v=31',
  '/scenarios.js?v=31',
  '/agent.js?v=31',
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
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Nie buforuj zapytań do API
  if (url.pathname.startsWith('/api/')) return;
  
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
