// Koodal service worker. Deliberately tiny: the app is online-first (live Firestore, auth,
// map tiles), so the only job here is a friendly screen when a page load fails offline.
// It only touches top-level navigations and the two precached shell files below: no
// RSC/client-nav fetches, no /_next assets, no Server Action POSTs, nothing cross-origin
// (Firebase, Cloudinary, map tiles).
const CACHE = 'koodal-shell-v1';
const SHELL = ['/offline.html', '/icons/android/launchericon-192x192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // offline.html needs its logo while the network is down.
  if (req.mode !== 'navigate') {
    const url = new URL(req.url);
    if (url.origin === self.location.origin && SHELL.includes(url.pathname)) {
      event.respondWith(caches.match(req, { cacheName: CACHE }).then((res) => res || fetch(req)));
    }
    return;
  }

  // Only a rejected fetch (truly offline) falls back; HTTP 4xx/5xx still reach Next's own pages.
  event.respondWith(
    fetch(req).catch(() =>
      caches.match('/offline.html', { cacheName: CACHE }).then(
        (res) => res || new Response('You are offline.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }),
      ),
    ),
  );
});
