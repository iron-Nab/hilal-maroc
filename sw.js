const CACHE_NAME = 'hilal-maroc-v7';
const ASSETS = [
  './',
  './index.html',
  './quran.html',
  './css/style.css',
  './css/quran.css',
  './js/astronomy.js',
  './js/sun.js',
  './js/prayer.js',
  './js/moon.js',
  './js/phases.js',
  './js/hilal.js',
  './js/hijri.js',
  './js/hadith.js',
  './js/mawaid.js',
  './js/history.js',
  './js/app.js',
  './js/quran-reader.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './manifest.json'
];

// Install: pre-cache all assets
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request).then(function(response) {
      // Update cache with fresh response
      var clone = response.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(event.request, clone);
      });
      return response;
    }).catch(function() {
      return caches.match(event.request);
    })
  );
});
