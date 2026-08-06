import { useState, useEffect, useCallback } from 'react';
import { X, Bell, CheckCircle, AlertCircle, Info, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Single Toast ──────────────────────────────────────────────────────────────
function Toast({ notification, onRemove }) {
    const icons = {
        success: <CheckCircle size={18} style={{ color: '#10b981' }} />,
        error:   <AlertCircle size={18} style={{ color: '#ef4444' }} />,
        info:    <Info size={18} style={{ color: '#4d6fff' }} />,
        win:     <Trophy size={18} style={{ color: '#fbbf24' }} />,
    };

    useEffect(() => {
        const t = setTimeout(() => onRemove(notification.id), notification.duration ?? 4000);
        return () => clearTimeout(t);
    }, [notification.id, notification.duration, onRemove]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="flex items-start gap-3 p-4 rounded-2xl max-w-xs w-full"
            style={{
                background: 'rgba(10,14,35,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
        >
            <span className="flex-shrink-0 mt-0.5">{icons[notification.type] ?? icons.info}</span>
            <div className="flex-1 min-w-0">
                {notification.title && (
                    <p className="text-white font-semibold text-sm leading-tight">{notification.title}</p>
                )}
                {notification.message && (
                    <p className="text-white/60 text-xs mt-0.5 leading-snug">{notification.message}</p>
                )}
            </div>
            <button onClick={() => onRemove(notification.id)}
                className="text-white/30 hover:text-white/70 transition-colors flex-shrink-0">
                <X size={14} />
            </button>
        </motion.div>
    );
}

// ── Notification Container ────────────────────────────────────────────────────
export function NotificationContainer({ notifications, removeNotification }) {
    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {notifications.map(n => (
                    <div key={n.id} className="pointer-events-auto">
                        <Toast notification={n} onRemove={removeNotification} />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useNotifications() {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((type, title, message, duration) => {
        const id = Date.now() + Math.random();
        setNotifications(prev => [...prev.slice(-4), { id, type, title, message, duration }]);
        return id;
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const notify = {
        success: (title, msg, dur) => addNotification('success', title, msg, dur),
        error:   (title, msg, dur) => addNotification('error', title, msg, dur),
        info:    (title, msg, dur) => addNotification('info', title, msg, dur),
        win:     (title, msg, dur) => addNotification('win', title, msg, dur),
    };

    return { notifications, removeNotification, notify };
}
