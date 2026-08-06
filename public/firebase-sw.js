// Firebase Service Worker for NXLY Exam Arena
// Handles background push notifications from Firebase Cloud Messaging (FCM).
// This works for BOTH web browsers AND Android WebView (future mobile app).
// File must be at: /public/firebase-sw.js (root of site)

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Firebase config — these must match your project
// NOTE: These are public values, safe to include in service worker
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
messaging.onBackgroundMessage((payload) => {
    const notification = payload.notification ?? {};
    const data         = payload.data         ?? {};

    const title = notification.title || 'NXLY Exam Arena';
    const body  = notification.body  || '';
    const url   = data.url           || '/';

    const options = {
        body:    body,
        icon:    notification.icon  || '/icons/icon-192.png',
        badge:   notification.badge || '/icons/badge-72.png',
        tag:     data.tag           || 'arena-notification',
        renotify: true,
        vibrate: [200, 100, 200],
        data:    { url },
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

// ── Config injection (posted from main thread) ────────────────────────────────
self.addEventListener('message', (event) => {
    if (event.data?.type === 'FIREBASE_CONFIG') {
        self.FIREBASE_CONFIG = event.data.config;
    }
});
