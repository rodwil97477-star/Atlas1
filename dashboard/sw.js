const CACHE = 'finanzas-shell-v11';
const SHELL = [
  'index.html', 'gastos.html', 'ritmo.html', 'compromisos.html', 'resumen.html',
  'style.css', 'data.js', 'app.js', 'manifest.json',
  'icon-192.png', 'icon-512.png', 'icon-maskable-192.png', 'icon-maskable-512.png',
  'fonts/anton-latin.woff2'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* El HTML/CSS/JS de la app (el "shell") se pide primero a la red: así el
   dashboard nunca se queda calculando con una versión vieja del código
   guardada en el dispositivo. El caché es solo el respaldo para cuando
   no hay conexión. Cualquier otra petición (la API del bot, etc.) no pasa
   por aquí: ese fetch ya lo maneja data.js con su propio caché. */
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if(url.origin !== self.location.origin || e.request.method !== 'GET') return;
  if(!SHELL.includes(url.pathname.replace(/^\//, '')) && url.pathname !== '/') return;

  e.respondWith(
    caches.open(CACHE).then(async cache => {
      try{
        const fresh = await fetch(e.request);
        if(fresh.ok) cache.put(e.request, fresh.clone());
        return fresh;
      }catch(err){
        const cached = await cache.match(e.request);
        if(cached) return cached;
        throw err;
      }
    })
  );
});
