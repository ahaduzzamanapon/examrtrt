// Firebase initialization for NXLY Exam Arena (Web)
// This handles FCM token registration for browser push notifications.
// The SAME Firebase project will be used for the future mobile app.

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
    apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

let app       = null;
let messaging = null;

function getFirebaseApp() {
    if (!app) app = initializeApp(firebaseConfig);
    return app;
}

function getFirebaseMessaging() {
    if (!messaging) messaging = getMessaging(getFirebaseApp());
    return messaging;
}

/**
 * Request notification permission and get FCM token.
 * Saves the token to the backend for this user.
 * Called after user logs in.
 */
export async function requestNotificationPermission() {
    // Don't run if Firebase isn't configured yet
    if (!import.meta.env.VITE_FIREBASE_API_KEY) {
        console.warn('[FCM] Firebase not configured. Add VITE_FIREBASE_* to .env');
        return null;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.log('[FCM] Notification permission denied');
            return null;
        }

        // Register the Firebase service worker
        const registration = await navigator.serviceWorker.register('/firebase-sw.js', {
            scope: '/',
        });

        const messaging = getFirebaseMessaging();
        const token     = await getToken(messaging, {
            vapidKey:            import.meta.env.VITE_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: registration,
        });

        if (token) {
            await saveTokenToServer(token);
            console.log('[FCM] Token registered:', token.substring(0, 20) + '...');
        }

        return token;
    } catch (error) {
        console.error('[FCM] Error getting token:', error);
        return null;
    }
}

/**
 * Save FCM token to Laravel backend.
 */
async function saveTokenToServer(fcmToken) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
    if (!csrfToken) return;

    await fetch('/push/subscribe', {
        method: 'POST',
        headers: {
            'Content-Type':  'application/json',
            'X-CSRF-TOKEN':  csrfToken,
        },
        body: JSON.stringify({ fcm_token: fcmToken, platform: 'WEB' }),
    });
}

/**
 * Handle foreground messages (when app is open).
 * Show a custom in-app toast instead of the browser notification.
 */
export function onForegroundMessage(callback) {
    if (!import.meta.env.VITE_FIREBASE_API_KEY) return;

    try {
        const messaging = getFirebaseMessaging();
        onMessage(messaging, (payload) => {
            console.log('[FCM] Foreground message:', payload);
            callback(payload);
        });
    } catch (error) {
        console.error('[FCM] onMessage error:', error);
    }
}

export { getFirebaseApp, getFirebaseMessaging };
