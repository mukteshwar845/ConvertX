const CACHE_NAME = 'convertx-shell-v1.2';

const STATIC_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg',
  '/favicon.png',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-192.png',
  '/icon-maskable-512.png',
];

// 1. Install: Precache critical application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_SHELL_ASSETS);
    })
  );
  // Note: We deliberately do NOT call self.skipWaiting() here automatically
  // so we do not interrupt active in-progress file conversions.
});

// 2. Activate: Clean up deprecated caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 3. Listen for manual skipWaiting messages triggered by the user ("Update Now")
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 4. Fetch: Smart caching with strict privacy safeguards
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Non-GET requests (POST, PUT, DELETE): strictly network, never cache
  if (request.method !== 'GET') {
    return;
  }

  // STRICT PRIVACY SAFEGUARD:
  // Never cache blob: URIs, data: URIs, or OCR endpoints containing user payloads
  if (
    url.protocol === 'blob:' ||
    url.protocol === 'data:' ||
    url.pathname.startsWith('/api/ocr')
  ) {
    return;
  }

  // API requests: Network-First with graceful offline fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            error: 'Network connection unavailable. You are currently offline.',
            offline: true,
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      })
    );
    return;
  }

  // Navigation requests (HTML SPA pages): Stale-While-Revalidate with index.html fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const indexFallback = await caches.match('/index.html');
          if (indexFallback) return indexFallback;
          return caches.match('/');
        })
    );
    return;
  }

  // Static Assets (JS, CSS, Web Fonts, Images): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache for subsequent visits
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
          })
          .catch(() => {
            // Offline - using cached copy
          });
        return cachedResponse;
      }

      // Not in cache: fetch from network and store in shell cache
      return fetch(request)
        .then((networkResponse) => {
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type === 'opaque'
          ) {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          if (request.destination === 'image') {
            return caches.match('/icon.svg');
          }
          return new Response('Offline asset unavailable', { status: 503 });
        });
    })
  );
});
