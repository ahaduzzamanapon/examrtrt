import { useEffect } from 'react';

const FIREBASE_CONFIG = {
    apiKey:            'AIzaSyDp_Af0POFa-EekqDEFdgLzVLNSAtYbU10',
    authDomain:        'exam-arena-6148c.firebaseapp.com',
    projectId:         'exam-arena-6148c',
    storageBucket:     'exam-arena-6148c.firebasestorage.app',
    messagingSenderId: '165082016850',
    appId:             '1:165082016850:web:9fb8f973b6e20743b4038b',
};

/**
 * Silently registers FCM token in the background after login/registration.
 * Runs once per browser session (tracked via sessionStorage).
 */
export function useFcmAutoRegister() {
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!('Notification' in window)) return;
        if (sessionStorage.getItem('fcm_registered')) return;

        const register = async () => {
            try {
                // Read VAPID key from DOM (set in app.blade.php)
                const vapidKey = document.getElementById('vapid-key')?.textContent?.trim()
                    ?? 'BKPEwvQSYwZhDuz0M3Bxodhf4Um980h5IvJJrIWcERJopbvV6JabGrSyk69lre_cOpqfRIAPsrhpMwVNvAjmWfc';

                // Read firebase config from DOM or use default
                let firebaseConfig = FIREBASE_CONFIG;
                try {
                    const raw = document.getElementById('firebase-config')?.textContent;
                    if (raw) firebaseConfig = JSON.parse(raw);
                } catch {}

                const { initializeApp, getApps, getApp } = await import('firebase/app');
                const { getMessaging, getToken }          = await import('firebase/messaging');

                const app       = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
                const messaging = getMessaging(app);

                // Register the service worker
                const swReg = await navigator.serviceWorker.register('/firebase-sw.js');

                // Request notification permission
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') return;

                const token = await getToken(messaging, {
                    vapidKey,
                    serviceWorkerRegistration: swReg,
                });

                if (!token) return;

                // Save to server
                const csrf = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
                const res = await fetch('/fcm-token', {
                    method:  'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrf,
                        'Accept':       'application/json',
                    },
                    body: JSON.stringify({ token }),
                });

                if (res.ok) {
                    sessionStorage.setItem('fcm_registered', '1');
                }
            } catch (err) {
                console.debug('[FCM Auto-Register]', err?.message ?? err);
            }
        };

        // 3-second delay so the page renders first
        const t = setTimeout(register, 3000);
        return () => clearTimeout(t);
    }, []);
}
