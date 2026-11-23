// Service Worker dla aplikacji mObywatel PWA
const CACHE_NAME = 'mobywatel-pwa-v18';
// wszystkie skrypty z index.html (wcześniej brakowało m.in. znak.js, mandaty.js, spotlight.js, więc offline aplikacja się wywracała)
const PRECACHE = [
  '/',
  '/index.html',
  '/i18n.js?v=6',
  '/style.css?v=50',
  '/ikony.js?v=50',
  '/osoby.js?v=50',
  '/sylwetki.js?v=50',
  '/core.js?v=50',
  '/accessibility.js?v=50',
  '/variants.js?v=50',
  '/scenarios.js?v=50',
  '/agent.js?v=50',
  '/znak-kod.js?v=50',
  '/znak.js?v=50',
  '/uslugi.js?v=50',
  '/weryfikacja.js?v=50',
  '/poczta.js?v=50',
  '/ikp-integracja.js?v=50',
  '/mandaty.js?v=50',
  '/powiadomienia-eksport.js?v=50',
  '/katalog-kart.js?v=50',
  '/spotlight.js?v=50',
  '/moduly-zdrowie.js?v=50',
  '/moduly-urzad.js?v=50',
  '/manifest.json',
  '/assets/icon-mobywatel.svg',
  '/assets/card-ikp-v2.svg',
  '/assets/card-firma-v2.svg',
  '/assets/card-emeryt.svg',
  '/assets/card-karta-polaka.svg',
  '/assets/card-nauczyciel.svg',
  '/assets/card-pwz-lekarz.svg',
  '/assets/card-pwz-pielegniarka.svg',
  '/assets/card-legitymacja-szkolna.svg',
  '/assets/card-hdk.svg',
  '/assets/card-osp.svg',
  '/assets/card-pz.svg',
  '/assets/strip-hdk.svg',
  '/assets/strip-osp.svg',
  '/assets/strip-pz.svg'
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
