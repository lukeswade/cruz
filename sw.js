const CACHE_NAME = 'cruz-portal-v25';
const STATIC_ASSETS = [
    '/',
    '/portal',
    '/style.css',
    '/portal.css',
    '/script.js',
    '/portal.js',
    '/assets/icon.png',
    '/assets/icon-192.png',
    '/assets/icon-512.png',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Inter:wght@300;400;500;600&family=Alex+Brush&display=swap'
];

// Install: cache static shell
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch: network-first for API, cache-first for static assets
self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);
    
    // Always go to network for API calls — never serve stale data
    if (url.pathname.startsWith('/api/')) {
        e.respondWith(fetch(e.request));
        return;
    }
    
    // For everything else: cache-first, fallback to network
    e.respondWith(
        caches.match(e.request, { ignoreSearch: true }).then(cached => {
            return cached || fetch(e.request).then(response => {
                // Cache successful GET responses
                if (response.ok && e.request.method === 'GET') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                }
                return response;
            });
        })
    );
});
