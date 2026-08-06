import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';

/**
 * Silently registers FCM token in the background after login/registration.
 * - Requests Notification permission if not yet granted
 * - Saves the FCM token to the server via POST /fcm-token
 * - Runs once per session (tracks in sessionStorage)
 */
export function useFcmAutoRegister() {
    const { firebase: firebaseProps } = usePage().props;

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!('Notification' in window)) return;

        // Only run once per browser session
        if (sessionStorage.getItem('fcm_registered')) return;

        const register = async () => {
            try {
                // Import Firebase SDK (npm package)
                const { initializeApp, getApps, getApp } = await import('firebase/app');
                const { getMessaging, getToken }          = await import('firebase/messaging');

                // Init Firebase (avoid duplicate app)
                const app = getApps().length > 0
                    ? getApp()
                    : initializeApp(firebaseProps?.config ?? {});

                const messaging = getMessaging(app);

                // Register service worker
                const swReg = await navigator.serviceWorker.register('/firebase-sw.js');

                // Request permission
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') return;

                const vapidKey = firebaseProps?.vapid_key ?? '';

                const token = await getToken(messaging, {
                    vapidKey,
                    serviceWorkerRegistration: swReg,
                });

                if (!token) return;

                // Save to server
                const csrf = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
                await fetch(route('fcm.token'), {
                    method:  'POST',
                    headers: {
                        'Content-Type':  'application/json',
                        'X-CSRF-TOKEN':  csrf,
                        'Accept':        'application/json',
                    },
                    body: JSON.stringify({ token }),
                });

                sessionStorage.setItem('fcm_registered', '1');
            } catch (err) {
                // Silent fail — don't interrupt the user experience
                console.debug('[FCM]', err);
            }
        };

        // Small delay so page renders first
        const t = setTimeout(register, 2000);
        return () => clearTimeout(t);
    }, []);
}
