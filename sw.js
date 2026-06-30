const CACHE_NAME = 'centersys-pwa-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html'
];

// Instalación del Service Worker e inclusión de recursos estáticos básicos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cacheando recursos esenciales de la PWA...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activación y remoción de cachés obsoletas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Borrando caché antigua de la PWA...', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia Stale-While-Revalidate (Carga rápido, actualiza de fondo de forma dinámica)
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/videos/')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          fetch(event.request).then(networkResponse => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse));
            }
          }).catch(() => {/* Ignorar errores de red de fondo */});
          
          return cachedResponse;
        }
        return fetch(event.request);
      })
  );
});
