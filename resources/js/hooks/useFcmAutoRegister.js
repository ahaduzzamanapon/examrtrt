import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';

const FIREBASE_CONFIG = {
    apiKey:            'AIzaSyDp_Af0POFa-EekqDEFdgLzVLNSAtYbU10',
    authDomain:        'exam-arena-6148c.firebaseapp.com',
    projectId:         'exam-arena-6148c',
    storageBucket:     'exam-arena-6148c.firebasestorage.app',
    messagingSenderId: '165082016850',
    appId:             '1:165082016850:web:9fb8f973b6e20743b4038b',
};

const VAPID = 'BKPEwvQSYwZhDuz0M3Bxodhf4Um980h5IvJJrIWcERJopbvV6JabGrSyk69lre_cOpqfRIAPsrhpMwVNvAjmWfc';

/**
 * Silently registers FCM token in the background.
 * Also handles FOREGROUND messages via onMessage → shows browser Notification.
 */
export function useFcmAutoRegister() {
    const { auth } = usePage().props;
    const serverHasToken = !!(auth?.user?.fcm_token);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!('Notification' in window)) return;
        if (!('serviceWorker' in navigator)) return;

        if (serverHasToken && sessionStorage.getItem('fcm_registered')) return;

        let unsubOnMessage = null;

        const register = async () => {
            try {
                if (Notification.permission === 'default') {
                    const perm = await Notification.requestPermission();
                    if (perm !== 'granted') return;
                } else if (Notification.permission === 'denied') {
                    return;
                }

                const vapidKey = document.getElementById('vapid-key')?.textContent?.trim() ?? VAPID;

                let firebaseConfig = FIREBASE_CONFIG;
                try {
                    const raw = document.getElementById('firebase-config')?.textContent;
                    if (raw) firebaseConfig = JSON.parse(raw);
                } catch {}

                const { initializeApp, getApps, getApp } = await import('firebase/app');
                const { getMessaging, getToken, onMessage } = await import('firebase/messaging');

                const app       = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
                const messaging = getMessaging(app);

                // ── Foreground message handler ────────────────────────────────
                // When site is open (foreground), service worker onBackgroundMessage
                // does NOT fire. We show the notification manually here.
                unsubOnMessage = onMessage(messaging, (payload) => {
                    const d = payload.data ?? {};
                    const title = d.title || 'Exam Arena';
                    const body  = d.body  || '';
                    const url   = d.url   || '/';

                    if (Notification.permission === 'granted') {
                        const n = new Notification(title, {
                            body,
                            icon:  d.icon  || '/favicon.png',
                            tag:   'exam-arena-broadcast',
                            renotify: false,
                            data: { url },
                        });
                        n.onclick = () => { window.focus(); window.location.href = url; n.close(); };
                    }
                });

                // ── Token registration ────────────────────────────────────────
                const swReg = await navigator.serviceWorker.register('/firebase-sw.js');
                const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: swReg });

                if (!token) return;

                const csrf = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
                const res = await fetch('/fcm-token', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf, 'Accept': 'application/json' },
                    body: JSON.stringify({ token }),
                });

                if (res.ok) sessionStorage.setItem('fcm_registered', '1');
            } catch (err) {
                console.debug('[FCM]', err?.message ?? err);
            }
        };

        const t = setTimeout(register, 2000);
        return () => {
            clearTimeout(t);
            unsubOnMessage?.();
        };
    }, [serverHasToken]);
}
