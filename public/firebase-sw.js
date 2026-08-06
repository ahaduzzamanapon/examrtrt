// Firebase Service Worker for NXLY Exam Arena
// Handles background push notifications from Firebase Cloud Messaging (FCM).
// DATA-ONLY messages: service worker shows notification exactly once.

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey:            'AIzaSyDp_Af0POFa-EekqDEFdgLzVLNSAtYbU10',
    authDomain:        'exam-arena-6148c.firebaseapp.com',
    projectId:         'exam-arena-6148c',
    storageBucket:     'exam-arena-6148c.firebasestorage.app',
    messagingSenderId: '165082016850',
    appId:             '1:165082016850:web:9fb8f973b6e20743b4038b',
});

const messaging = firebase.messaging();

// ── Background message handler ────────────────────────────────────────────────
// Only fires for DATA-ONLY messages (no 'notification' field in payload).
// We read from payload.data — this shows the notification EXACTLY ONCE.
messaging.onBackgroundMessage((payload) => {
    const d = payload.data ?? {};

    const title = d.title || 'Exam Arena';
    const body  = d.body  || '';
    const url   = d.url   || '/';
    const icon  = d.icon  || '/favicon.png';
    const image = d.image || undefined;

    const options = {
        body,
        icon,
        badge:    '/favicon.png',
        image:    image || undefined,
        tag:      'exam-arena-broadcast',
        renotify: true,
        vibrate:  [200, 100, 200],
        requireInteraction: false,
        data: { url },
        actions: [
            { action: 'open',    title: 'খুলুন' },
            { action: 'dismiss', title: 'বাতিল' },
        ],
    };

    return self.registration.showNotification(title, options);
});

// ── Notification click ────────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    const targetUrl = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) {
                    client.focus();
                    client.navigate(targetUrl);
                    return;
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
