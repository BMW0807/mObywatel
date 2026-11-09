// Service Worker dla aplikacji mObywatel PWA
const CACHE_NAME = 'mobywatel-pwa-v14';
// wszystkie skrypty z index.html (wcześniej brakowało m.in. znak.js, mandaty.js, spotlight.js, więc offline aplikacja się wywracała)
const PRECACHE = [
  '/',
  '/index.html',
  '/i18n.js?v=6',
  '/style.css?v=43',
  '/osoby.js?v=44',
  '/sylwetki.js?v=44',
  '/core.js?v=44',
  '/accessibility.js?v=44',
  '/variants.js?v=44',
  '/scenarios.js?v=44',
  '/agent.js?v=44',
  '/znak-kod.js?v=44',
  '/znak.js?v=44',
  '/uslugi.js?v=44',
  '/weryfikacja.js?v=44',
  '/poczta.js?v=44',
  '/ikp-integracja.js?v=44',
  '/mandaty.js?v=44',
  '/powiadomienia-eksport.js?v=44',
  '/katalog-kart.js?v=44',
  '/spotlight.js?v=44',
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
  // API (stan asystenta, znak mObywatela, słowniki) zawsze z sieci: odpowiedzi z pamięci podręcznej byłyby nieaktualne
  const url = new URL(event.request.url);
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) return;
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
