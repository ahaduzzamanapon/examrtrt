// NXLY Exam Arena — Service Worker v1.0
// Handles browser push notifications and offline caching

const CACHE_NAME = 'arena-v1';
const STATIC_ASSETS = [
    '/',
    '/offline.html',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
];

// ── Install & Cache ───────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS).catch(() => {
                // Silently fail if assets not yet built
            });
        })
    );
    self.skipWaiting();
});

// ── Activate ──────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// ── Push Notification Received ────────────────────────────────────────────────
self.addEventListener('push', (event) => {
    let data = {};

    try {
        data = event.data ? event.data.json() : {};
    } catch (e) {
        data = { title: 'NXLY Exam Arena', body: event.data?.text() ?? '' };
    }

    const title   = data.title   || 'NXLY Exam Arena';
    const options = {
        body:    data.body   || '',
        icon:    data.icon   || '/icons/icon-192.png',
        badge:   data.badge  || '/icons/badge-72.png',
        tag:     data.tag    || 'arena-notification',
        renotify: true,
        vibrate: [200, 100, 200], // Mobile vibration pattern
        data: {
            url: data.url || '/',
        },
        actions: data.url ? [
            { action: 'open',    title: 'খুলুন' },
            { action: 'dismiss', title: 'বাতিল' },
        ] : [],
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// ── Notification Click ────────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    const targetUrl = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If app is already open, focus it and navigate
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.focus();
                    client.navigate(targetUrl);
                    return;
                }
            }
            // Otherwise open a new window
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});

// ── Background Sync (for offline exam answer queue) ───────────────────────────
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-exam-answers') {
        event.waitUntil(syncExamAnswers());
    }
});

async function syncExamAnswers() {
    try {
        // Read queued answers from IndexedDB and POST to server
        // (IndexedDB logic handled in main app)
        const channel = new BroadcastChannel('arena-sync');
        channel.postMessage({ type: 'SYNC_REQUESTED' });
    } catch (e) {
        console.error('[SW] Sync failed:', e);
    }
}
