const CACHE_NAME = 'centersys-pwa-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/fotos/logo_centro.png',
  '/fotos/mobile-fitness.jpg',
  '/fotos/pizza-cell.jpg',
  '/fotos/taxiapp1.jpg',
  '/fotos/ban1.png',
  '/fotos/calendarpng.png',
  '/fotos/scanning_qr.png',
  '/fotos/calendarjpg.jpg',
  '/fotos/3mobile.jpg'
];

// Instalación del Service Worker e inclusión de recursos estáticos en caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cacheando recursos de la PWA...');
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

// Estrategia: Cache First, fallback a Red
self.addEventListener('fetch', event => {
  // Ignoramos peticiones de archivos de video pesados para evitar problemas de streaming en caché
  if (event.request.url.includes('/videos/')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});