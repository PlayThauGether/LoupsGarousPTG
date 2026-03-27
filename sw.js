// Service Worker — playthaugether.github.io/LoupsGarousPTG/
const CACHE_NAME = 'loups-garous-v3';
const BASE = '/LoupsGarousPTG/';

const ASSETS = [
  'LoupsGarous_v2.html',
  'manifest.json',
  'logo.png',
  'icon-512.png',
  'icon-192.png',
  'icon-180.png',
  'icon-152.png',
  'icon-120.png',
  'icon-76.png',
  'favicon-32.png',
  'sw.js'
].map(f => BASE + f);

// ── INSTALL : cache un par un, un échec ne bloque pas les autres
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for(const url of ASSETS){
        try {
          const res = await fetch(url, { cache: 'reload' });
          if(res.ok) await cache.put(url, res);
          else console.warn('[SW] Skip', res.status, url);
        } catch(e) {
          console.warn('[SW] Fetch failed:', url);
        }
      }
      // Fonts Google (pas bloquant)
      try {
        await cache.add('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600;700&family=IM+Fell+English:ital@0;1&display=swap');
      } catch(e) {}
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE : supprimer anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ── FETCH : cache-first avec revalidation en fond
self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Requêtes externes (Google Fonts, CDN Babel/React) : stale-while-revalidate
  if(url.origin !== self.location.origin){
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(event.request).then(cached => {
          const fresh = fetch(event.request)
            .then(res => { if(res.ok) cache.put(event.request, res.clone()); return res; })
            .catch(() => cached);
          return cached || fresh;
        })
      )
    );
    return;
  }

  // Requêtes locales : cache-first + revalidation silencieuse
  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request).then(cached => {
        // Revalidation en arrière-plan
        fetch(event.request)
          .then(res => { if(res.ok) cache.put(event.request, res.clone()); })
          .catch(() => {});
        // Retourner le cache si dispo, sinon réseau, sinon fallback HTML
        return cached || fetch(event.request)
          .then(res => { if(res.ok) cache.put(event.request, res.clone()); return res; })
          .catch(() => cache.match(BASE + 'LoupsGarous_v2.html'));
      })
    )
  );
});
