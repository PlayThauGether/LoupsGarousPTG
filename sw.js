const CACHE = 'loups-garous-v1';
const ASSETS = [
  './LoupsGarous_v2.html',
  './manifest.json',
  './logo.png',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png',
  './icon-152.png',
  './icon-120.png',
  './icon-76.png',
  'https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600;700&family=IM+Fell+English:ital@0;1&display=swap'
];

// Installation : mise en cache de tous les assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activation : supprimer les anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch : cache-first, fallback réseau
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => caches.match('./LoupsGarous_v2.html')))
  );
});
