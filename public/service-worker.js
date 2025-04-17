const CACHE_NAME = 'get-requests-cache-v1'
const CACHE_URLS = []

const urlsToFetch = ['open-bus-stride-api', 'fonts.googleapis.com']

// Install event: cache basic URLs (optional)
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_URLS)))
})

// Fetch event: cache GET requests
self.addEventListener('fetch', (event) => {
  if (
    event.request.method === 'GET' &&
    urlsToFetch.some((url) => event.request.url.includes(url))
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // Return cached response if available, else fetch from network
        return (
          cachedResponse ||
          fetch(event.request).then((response) => {
            // Clone the response to save it in the cache
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone)
            })
            console.log('cached ', event.request)
            return response
          })
        )
      }),
    )
  }
})
