const CACHE_NAME = 'get-requests-cache-v3'
const CACHE_URLS = ['open-bus-stride-api']
// The API sends no ETag or Last-Modified, so a revalidation always costs the full body.
// Reuse a cached answer for this long instead, and only then pay for a new one.
const MAX_AGE_MS = 1000 * 60 * 30 // 30 minutes
// A cross-origin response only exposes content-type and content-length unless the server
// opts more in, so its `date` cannot be read here. Stamp the storing time on the way in
// and read that back instead — the age in this cache is what the max-age is about anyway.
const CACHED_AT_HEADER = 'x-cached-at'

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

// Fetch event: serve GET requests from the cache until they age out
self.addEventListener('fetch', (event) => {
  if (event.request.method === 'GET' && CACHE_URLS.some((url) => event.request.url.includes(url))) {
    event.respondWith(cacheWithMaxAge(event))
  }
})

async function cacheWithMaxAge(event) {
  const cachedResponse = await caches.match(event.request)
  if (cachedResponse && !isExpired(cachedResponse)) {
    return cachedResponse
  }

  try {
    const response = await fetch(event.request)
    if (response.ok) {
      event.waitUntil(cacheResponse(event.request, response.clone()))
    }
    return response
  } catch (error) {
    // Offline, or the API is down: an expired answer still beats no answer at all.
    if (cachedResponse) return cachedResponse
    throw error
  }
}

function isExpired(response) {
  const cachedAt = Number(response.headers.get(CACHED_AT_HEADER))
  // An entry from an older version of this worker has no stamp: treat it as expired.
  return !cachedAt || Date.now() - cachedAt > MAX_AGE_MS
}

async function cacheResponse(request, response) {
  // An empty list is a moment in time, not an answer: it is what the API returns for a
  // date the GTFS ETL has not loaded yet. Cached, it would outlive that gap and keep
  // hiding data that has since arrived.
  const body = await response.text()
  if (body === '[]') return

  const headers = new Headers(response.headers)
  headers.set(CACHED_AT_HEADER, Date.now().toString())
  const cache = await caches.open(CACHE_NAME)
  await cache.put(
    request,
    new Response(body, { status: response.status, statusText: response.statusText, headers }),
  )
}
