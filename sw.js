const CACHE = 'finance-v8.0';
const assets = [
    './',
    './index.html',
    './style.css',
    './script.js'
];

self.addEventListener('install', e => {
    self.skipWaiting(); // Fuerza la activación inmediata
    e.waitUntil(
        caches.open(CACHE).then(c => c.addAll(assets))
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE).map(key => caches.delete(key))
            );
        })
    );
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(r => r || fetch(e.request))
    );
});
