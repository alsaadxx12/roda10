const CACHE_NAME = 'fly4-cache-v3';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
    // 1. Skip non-GET requests
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // 2. CRITICAL: Bypass ALL external requests
    // This fixes CORS issues with Firebase Storage, UltraMsg, etc.
    if (url.origin !== self.location.origin) {
        return;
    }

    // 3. Bypass explicit API/Storage patterns even if same-origin (unlikely but safe)
    if (url.href.includes('firebasestorage.googleapis.com') || url.href.includes('api.ultramsg.com')) {
        return;
    }

    // 4. For HTML/Manifest: Network-First
    if (event.request.mode === 'navigate' || urlsToCache.includes(url.pathname)) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const clonedResponse = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clonedResponse);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request);
                })
        );
        return;
    }

    // 5. For other local static assets (JS, CSS, local images): Cache-First
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});
