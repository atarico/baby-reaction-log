/*
 * Minimal offline shell. The log itself lives in IndexedDB, which never needs
 * the network — this only makes sure the app boots with no connection at 3am.
 */
const CACHE = 'baby-moves-v1'

const cacheable = (url) =>
  url.origin === self.location.origin ||
  url.hostname === 'fonts.googleapis.com' ||
  url.hostname === 'fonts.gstatic.com'

const store = async (request, response) => {
  const cache = await caches.open(CACHE)
  await cache.put(request, response)
}

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  // Network-first for the document so a new deploy is picked up immediately.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          void store(request, response.clone())
          return response
        })
        .catch(async () => (await caches.match(request)) ?? (await caches.match('/index.html'))),
    )
    return
  }

  const url = new URL(request.url)
  if (!cacheable(url)) return

  // Cache-first for hashed assets and fonts: they never change under the same URL.
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ??
        fetch(request).then((response) => {
          if (response.ok) void store(request, response.clone())
          return response
        }),
    ),
  )
})
