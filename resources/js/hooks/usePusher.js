import { useEffect, useRef, useCallback } from 'react';
import Pusher from 'pusher-js';

let pusherInstance = null;

function getPusher() {
    if (!pusherInstance) {
        pusherInstance = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
            cluster:   import.meta.env.VITE_PUSHER_APP_CLUSTER || 'ap2',
            forceTLS:  true,
            authEndpoint: '/broadcasting/auth',
            auth: {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
                },
            },
        });
    }
    return pusherInstance;
}

/**
 * Subscribes to a user's private Pusher channel and listens for events.
 * Returns channel object and an unsubscribe cleanup function.
 *
 * @param {number} userId
 * @param {Object} handlers - { onNotification, onWalletUpdate, onBattleInvite }
 */
export function useUserChannel(userId, handlers = {}) {
    const channelRef = useRef(null);

    useEffect(() => {
        if (!userId) return;

        const pusher  = getPusher();
        const channel = pusher.subscribe(`private-user.${userId}`);
        channelRef.current = channel;

        // Generic notification (exam reminders, results, etc.)
        if (handlers.onNotification) {
            channel.bind('notification', handlers.onNotification);
        }

        // Wallet balance updated
        if (handlers.onWalletUpdate) {
            channel.bind('wallet.updated', handlers.onWalletUpdate);
        }

        // Battle invite received
        if (handlers.onBattleInvite) {
            channel.bind('battle.invite', handlers.onBattleInvite);
        }

        return () => {
            channel.unbind_all();
            pusher.unsubscribe(`private-user.${userId}`);
        };
    }, [userId]);

    return channelRef;
}

/**
 * Subscribe to an exam's presence channel (for live leaderboard).
 */
export function useExamChannel(examId, handlers = {}) {
    const channelRef = useRef(null);

    useEffect(() => {
        if (!examId) return;

        const pusher  = getPusher();
        const channel = pusher.subscribe(`presence-exam.${examId}`);
        channelRef.current = channel;

        if (handlers.onLeaderboardUpdate) {
            channel.bind('leaderboard.updated', handlers.onLeaderboardUpdate);
        }
        if (handlers.onMemberAdded) {
            channel.bind('pusher:member_added', handlers.onMemberAdded);
        }
        if (handlers.onMemberRemoved) {
            channel.bind('pusher:member_removed', handlers.onMemberRemoved);
        }

        return () => {
            channel.unbind_all();
            pusher.unsubscribe(`presence-exam.${examId}`);
        };
    }, [examId]);

    return channelRef;
}

/**
 * Subscribe to a battle presence channel (for 1v1 real-time sync).
 */
export function useBattleChannel(battleId, handlers = {}) {
    const channelRef = useRef(null);

    useEffect(() => {
        if (!battleId) return;

        const pusher  = getPusher();
        const channel = pusher.subscribe(`presence-battle.${battleId}`);
        channelRef.current = channel;

        if (handlers.onStateSync) {
            channel.bind('battle.state', handlers.onStateSync);
        }
        if (handlers.onMemberLeft) {
            channel.bind('pusher:member_removed', handlers.onMemberLeft); // Forfeit detection
        }

        return () => {
            channel.unbind_all();
            pusher.unsubscribe(`presence-battle.${battleId}`);
        };
    }, [battleId]);

    return channelRef;
}

export { getPusher };
