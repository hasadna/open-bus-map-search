const CACHE_NAME = 'get-requests-cache-v2'
const CACHE_URLS = ['open-bus-stride-api', 'fonts.googleapis.com']

// Install event: cache basic URLs (optional)
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_URLS)))
  self.skipWaiting()
})

// Activate event: clear old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        }),
      ),
    ),
  )
  self.clients.claim()
})

// Fetch event: cache GET requests except when query includes today's date
self.addEventListener('fetch', (event) => {
  const today = new Date().toISOString().slice(0, 10) // e.g. "2025-10-28"

  if (
    event.request.method === 'GET' &&
    !event.request.url.includes(today) &&
    CACHE_URLS.some((url) => event.request.url.includes(url))
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // Return cached response if available
        if (cachedResponse) return cachedResponse

        // Otherwise, fetch from network and cache the response
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone)
            })
          }
          return response
        })
      }),
    )
  }
})
