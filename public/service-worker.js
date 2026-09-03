const CACHE_NAME = 'get-requests-cache-v3'
const CACHE_URLS = ['open-bus-stride-api']

self.addEventListener('install', () => {
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
    event.respondWith(cacheFirst(event))
  }
})

async function cacheFirst(event) {
  const cachedResponse = await caches.match(event.request)
  if (cachedResponse) return cachedResponse

  const response = await fetch(event.request)
  if (response.ok) {
    event.waitUntil(cacheUnlessEmpty(event.request, response.clone()))
  }
  return response
}

// An empty list is a moment in time, not an answer: it is what the API returns for a date
// its ETL has not loaded yet. Nothing in this cache ever expires, so storing one would keep
// hiding data that has since arrived, for as long as the browser keeps the cache.
async function cacheUnlessEmpty(request, response) {
  if (isEmptyBody(await response.clone().text())) return

  const cache = await caches.open(CACHE_NAME)
  await cache.put(request, response)
}

const isEmptyBody = (body) => body.length <= 8 && ['', '[]', '{}', 'null'].includes(body.trim())
