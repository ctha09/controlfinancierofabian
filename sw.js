self.addEventListener('fetch', (event) => {
    // No guarda caché para que siempre veas tus cambios de hoy
    event.respondWith(fetch(event.request));
});
