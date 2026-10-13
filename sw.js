const CACHE_NAME = 'loups-garous-v10';
const BASE = '/LoupsGarousPTG/';

const ASSETS = [
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'logo.png',
  BASE + 'icon-512.png',
  BASE + 'icon-192.png',
  BASE + 'icon-180.png',
  BASE + 'icon-152.png',
  BASE + 'icon-120.png',
  BASE + 'icon-76.png',
  BASE + 'favicon-32.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for(const url of ASSETS){
        try {
          const res = await fetch(url, {cache:'reload'});
          if(res.ok) await cache.put(url, res);
        } catch(e) { console.warn('[SW] skip:', url); }
      }
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request).then(cached => {
        const fresh = fetch(event.request)
          .then(res => { if(res.ok) cache.put(event.request, res.clone()); return res; })
          .catch(() => cached || cache.match(BASE + 'index.html'));
        return cached || fresh;
      })
    )
  );
});
