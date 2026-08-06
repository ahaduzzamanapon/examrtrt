import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu, X, Home, Zap, BookOpen, Wallet, User,
    Trophy, Sword, Brain, Settings, LogOut, Bell,
} from 'lucide-react';
import BottomNav from './BottomNav';
import ChatbotWidget from './ChatbotWidget';
import { NotificationContainer, useNotifications } from './NotificationSystem';

const drawerItems = [
    { href: 'dashboard',          icon: Home,    label: 'হোম' },
    { href: 'exams.index',        icon: Zap,     label: 'লাইভ কনটেস্ট' },
    { href: 'battle.index',       icon: Sword,   label: '১ vs ১ ব্যাটেল' },
    { href: 'practice.index',     icon: BookOpen, label: 'প্র্যাকটিস টেস্ট' },
    { href: 'survival.index',     icon: Brain,   label: 'সারভাইভাল মোড' },
    { href: 'leaderboard.index',  icon: Trophy,  label: 'লিডারবোর্ড' },
    { href: 'wallet.index',       icon: Wallet,  label: 'ওয়ালেট' },
    { href: 'profile.show',       icon: User,    label: 'প্রোফাইল' },
];

export default function MobileLayout({ children, title = '' }) {
    const { auth } = usePage().props;
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Initialize Firebase FCM notifications
    useNotifications();

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0e23 0%, #0f1a3e 50%, #0a1628 100%)' }}>

            {/* ── Top App Bar ───────────────────────────────────────────── */}
            <header
                className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14"
                style={{
                    paddingTop: 'env(safe-area-inset-top, 0px)',
                    background: 'rgba(10,14,35,0.88)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                }}
            >
                {/* Hamburger */}
                <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => setDrawerOpen(true)}
                    className="touch-target rounded-xl"
                    aria-label="মেনু খুলুন"
                >
                    <Menu size={22} className="text-white/80" />
                </motion.button>

                {/* Brand */}
                <Link href={route('dashboard')} className="flex items-center gap-2">
                    <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-xs"
                        style={{ background: 'linear-gradient(135deg, #4d6fff, #7c3aed)' }}
                    >
                        N
                    </div>
                    <span className="font-bold text-white text-sm tracking-wide">
                        NXLY <span className="text-gradient">Arena</span>
                    </span>
                </Link>

                {/* Right actions */}
                <div className="flex items-center gap-1">
                    <Link href={route('wallet.index')} className="touch-target rounded-xl">
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold"
                            style={{ background: 'rgba(77,111,255,0.15)', border: '1px solid rgba(77,111,255,0.3)', color: '#93b4ff' }}>
                            <Wallet size={12} />
                            ৳{parseFloat(auth.user?.wallet_balance ?? 0).toFixed(0)}
                        </div>
                    </Link>
                    <motion.button whileTap={{ scale: 0.88 }} className="touch-target rounded-xl" aria-label="নোটিফিকেশন">
                        <Bell size={20} className="text-white/60" />
                    </motion.button>
                </div>
            </header>

            {/* ── Slide-out Drawer ──────────────────────────────────────── */}
            <AnimatePresence>
                {drawerOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDrawerOpen(false)}
                            className="fixed inset-0 z-50"
                            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                        />

                        {/* Drawer panel */}
                        <motion.aside
                            key="drawer"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
                            className="fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col overflow-y-auto"
                            style={{
                                background: 'rgba(10,14,35,0.97)',
                                backdropFilter: 'blur(30px)',
                                WebkitBackdropFilter: 'blur(30px)',
                                borderRight: '1px solid rgba(255,255,255,0.08)',
                                paddingTop: 'env(safe-area-inset-top, 0px)',
                                paddingBottom: 'env(safe-area-inset-bottom, 16px)',
                            }}
                        >
                            {/* Drawer header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                                <div className="flex items-center gap-3">
                                    {auth.user?.avatar ? (
                                        <img src={auth.user.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-white/20" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                            style={{ background: 'linear-gradient(135deg, #4d6fff, #7c3aed)' }}>
                                            {auth.user?.name?.[0]?.toUpperCase() ?? 'U'}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-white text-sm font-semibold truncate max-w-[140px]">{auth.user?.name}</p>
                                        <p className="text-white/40 text-xs">{auth.user?.role}</p>
                                    </div>
                                </div>
                                <motion.button whileTap={{ scale: 0.88 }} onClick={() => setDrawerOpen(false)} className="touch-target rounded-xl">
                                    <X size={20} className="text-white/50" />
                                </motion.button>
                            </div>

                            {/* Wallet quick view */}
                            <div className="mx-4 mt-4 p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(77,111,255,0.18), rgba(124,58,237,0.12))', border: '1px solid rgba(77,111,255,0.25)' }}>
                                <p className="text-white/50 text-xs mb-1">ওয়ালেট ব্যালেন্স</p>
                                <p className="text-2xl font-bold text-white">৳{parseFloat(auth.user?.wallet_balance ?? 0).toFixed(2)}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="badge-gold text-[10px]">🎟 {auth.user?.free_contest_passes ?? 0} পাস</span>
                                    <span className="badge-blue text-[10px]">🔥 {auth.user?.streak_count ?? 0} দিন</span>
                                </div>
                            </div>

                            {/* Nav items */}
                            <nav className="flex-1 px-3 mt-4 space-y-1">
                                {drawerItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={route(item.href)}
                                            onClick={() => setDrawerOpen(false)}
                                            className="block rounded-xl"
                                            style={{ minHeight: '44px' }}
                                        >
                                            <div
                                                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all text-sm font-medium"
                                                style={{ color: 'rgba(255,255,255,0.6)' }}
                                            >
                                                <Icon size={18} />
                                                <span>{item.label}</span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </nav>

                            {/* Bottom section */}
                            <div className="px-4 mt-auto space-y-1">
                                {auth.user?.role === 'ADMIN' && (
                                    <Link href={route('admin.dashboard')} onClick={() => setDrawerOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
                                        style={{ background: 'rgba(245,158,11,0.15)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.25)' }}>
                                        <Settings size={16} />
                                        অ্যাডমিন প্যানেল
                                    </Link>
                                )}
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    onClick={() => setDrawerOpen(false)}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
                                    style={{ color: 'rgba(239,68,68,0.8)' }}
                                >
                                    <LogOut size={16} />
                                    লগ আউট
                                </Link>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ── Page Content ──────────────────────────────────────────── */}
            <main
                className="pb-20"
                style={{ paddingTop: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}
            >
                {children}
            </main>

            {/* ── Bottom Navigation ─────────────────────────────────────── */}
            <BottomNav />

            {/* ── Chatbot Widget ────────────────────────────────────────── */}
            <ChatbotWidget />

            {/* ── Firebase FCM Toast Notifications ─────────────────────── */}
            <NotificationContainer />
        </div>
    );
}
