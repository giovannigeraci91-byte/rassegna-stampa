/* Service worker minimo: serve solo a rendere l'app realmente installabile
   e utilizzabile offline sull'ultimo guscio caricato.
   I file markdown NON vengono mai serviti dalla cache prima della rete,
   così la rassegna mostrata è sempre quella aggiornata. */

const CACHE = 'rassegna-shell-v1';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(SHELL))
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Mette in cache solo risposte riuscite: un 404 (es. archivio non ancora
  // pubblicato, asset mancante durante un deploy) non deve restare in cache
  // come falso fallback offline.
  function cacheIfOk(req, res){
    if (res.ok) {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => undefined);
    }
    return res;
  }

  // Markdown: sempre rete per primo, cache solo come rete di sicurezza offline.
  if (url.pathname.endsWith('.md')) {
    event.respondWith(
      fetch(req)
        .then((res) => cacheIfOk(req, res))
        .catch(() => caches.match(req).then((hit) => hit || Promise.reject(new Error('offline'))))
    );
    return;
  }

  // Guscio dell'app: rete per primo con fallback su cache.
  event.respondWith(
    fetch(req)
      .then((res) => cacheIfOk(req, res))
      .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
  );
});
