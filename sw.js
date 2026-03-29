// Cambiamos el nombre a v9 para forzar la actualización
const CACHE_NAME = 'financeflow_elite_v9';

self.addEventListener('install', (event) => {
    self.skipWaiting(); // Obliga al service worker nuevo a tomar el control
});

self.addEventListener('fetch', (event) => {
    // No guarda nada en caché para que siempre veas tu código real
    event.respondWith(fetch(event.request));
});
