import { useEffect, useState, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import { requestNotificationPermission, onForegroundMessage } from '@/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, CheckCircle, AlertCircle, Zap, Wallet } from 'lucide-react';

// ── Toast Component ────────────────────────────────────────────────────────────
const TOAST_ICONS = {
    exam_reminder: { icon: Zap,         color: '#4d6fff' },
    result:        { icon: CheckCircle, color: '#10b981' },
    wallet:        { icon: Wallet,      color: '#f59e0b' },
    battle:        { icon: Zap,         color: '#ef4444' },
    general:       { icon: Bell,        color: '#a78bfa' },
};

function NotificationToast({ notification, onDismiss }) {
    const config = TOAST_ICONS[notification.type] ?? TOAST_ICONS.general;
    const Icon   = config.icon;

    useEffect(() => {
        const timer = setTimeout(() => onDismiss(notification.id), 5000);
        return () => clearTimeout(timer);
    }, [notification.id]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,   scale: 1    }}
            exit={{    opacity: 0, y: -20,  scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="flex items-start gap-3 p-4 rounded-2xl max-w-sm w-full cursor-pointer"
            style={{
                background:      'rgba(15,20,50,0.95)',
                backdropFilter:  'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border:          '1px solid rgba(255,255,255,0.12)',
                boxShadow:       '0 8px 32px rgba(0,0,0,0.5)',
            }}
            onClick={() => {
                if (notification.actionUrl) window.location.href = notification.actionUrl;
                onDismiss(notification.id);
            }}
        >
            {/* Icon */}
            <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: config.color + '22', border: `1px solid ${config.color}44` }}
            >
                <Icon size={18} style={{ color: config.color }} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold leading-tight">{notification.title}</p>
                <p className="text-white/60 text-xs mt-0.5 line-clamp-2">{notification.body}</p>
            </div>

            {/* Close */}
            <button
                onClick={(e) => { e.stopPropagation(); onDismiss(notification.id); }}
                className="touch-target flex-shrink-0 rounded-lg flex items-center justify-center"
                style={{ minWidth: 32, minHeight: 32 }}
            >
                <X size={14} className="text-white/40" />
            </button>
        </motion.div>
    );
}

// ── Main Notification Provider ─────────────────────────────────────────────────
export function NotificationContainer() {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((notif) => {
        const id = notif.id ?? Date.now().toString();
        setToasts(prev => [{ ...notif, id }, ...prev].slice(0, 5)); // max 5 toasts
    }, []);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Handle FCM foreground messages
    useEffect(() => {
        onForegroundMessage((payload) => {
            addToast({
                type:      payload.data?.type  ?? 'general',
                title:     payload.notification?.title ?? 'NXLY Exam Arena',
                body:      payload.notification?.body  ?? '',
                actionUrl: payload.data?.url ?? null,
            });
        });
    }, [addToast]);

    return (
        <div
            className="fixed z-[100] flex flex-col gap-2 pointer-events-none"
            style={{
                top:   'calc(env(safe-area-inset-top, 0px) + 64px)',
                left:  '50%',
                transform: 'translateX(-50%)',
                width: 'calc(100% - 32px)',
                maxWidth: '380px',
            }}
        >
            <AnimatePresence mode="popLayout">
                {toasts.map(toast => (
                    <div key={toast.id} className="pointer-events-auto">
                        <NotificationToast notification={toast} onDismiss={dismiss} />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
}

/**
 * Hook to initialize FCM and Pusher notifications after login.
 * Call this once in the main layout.
 */
export function useNotifications({ onBattleInvite, onWalletUpdate } = {}) {
    const { auth } = usePage().props;

    useEffect(() => {
        if (!auth?.user) return;

        // Request browser notification permission + get FCM token
        requestNotificationPermission().catch(console.error);

    }, [auth?.user?.id]);
}
