import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu, X, Home, Zap, BookOpen, Wallet, User,
    Trophy, Sword, Brain, Settings, LogOut, Film, FileText, Sparkles, Flag,
} from 'lucide-react';
import BottomNav from './BottomNav';
import ChatbotWidget from './ChatbotWidget';
import { NotificationContainer, useNotifications } from './NotificationSystem';
import { useFcmAutoRegister } from '@/hooks/useFcmAutoRegister';

const NAV_ITEMS = [
    { href: 'dashboard',         icon: Home,     label: 'হোম' },
    { href: 'exams.index',       icon: Zap,      label: 'লাইভ কনটেস্ট' },
    { href: 'reel.index',        icon: Film,     label: 'রিল প্রাকটিস' },
    { href: 'model-test.index',  icon: FileText, label: 'মডেল টেস্ট' },
    { href: 'battle.index',      icon: Sword,    label: '1v1 ব্যাটেল' },
    { href: 'practice.index',    icon: BookOpen, label: 'প্রাকটিস' },
    { href: 'survival.index',    icon: Brain,    label: 'সারভাইভাল' },
    { href: 'leaderboard.index', icon: Trophy,   label: 'লিডারবোর্ড' },
    { href: 'disputes.index',    icon: Flag,     label: 'আমার রিপোর্ট' },
    { href: 'tokens.index',      icon: Sparkles, label: 'টোকেন স্টোর' },
    { href: 'wallet.index',      icon: Wallet,   label: 'ওয়ালেট' },
    { href: 'profile.show',      icon: User,     label: 'প্রোফাইল' },
];

// ── Desktop Sidebar ───────────────────────────────────────────────────────────
function DesktopSidebar({ auth }) {
    const current = usePage().url;

    return (
        <aside style={{
            position: 'fixed', top: 0, left: 0, bottom: 0,
            width: 240,
            background: 'rgba(8,11,28,0.97)',
            borderRight: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            display: 'flex', flexDirection: 'column',
            zIndex: 40, padding: '24px 12px',
        }}>
            {/* Logo */}
            <div style={{ padding: '0 12px', marginBottom: 28 }}>
                <Link href={route('dashboard')}>
                    <img src="/logo.png?v=1" alt="Exam Arena" style={{ height: 38, objectFit: 'contain' }} />
                </Link>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto', paddingRight: 4 }}>
                {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                    const isDash     = href === 'dashboard' && current === '/dashboard';
                    const isActive   = isDash || (href !== 'dashboard' && current.startsWith('/' + href.split('.')[0]));
                    const showBadge  = href === 'exams.index' && !!usePage().props.hasActiveContest;

                    return (
                        <Link key={href} href={route(href)} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 14px', borderRadius: 12,
                            background: isActive ? 'rgba(77,111,255,0.18)' : 'transparent',
                            border: `1px solid ${isActive ? 'rgba(77,111,255,0.3)' : 'transparent'}`,
                            color: isActive ? '#93b4ff' : 'rgba(255,255,255,0.6)',
                            fontWeight: isActive ? 700 : 500,
                            fontSize: 14, textDecoration: 'none',
                            transition: 'all 0.15s',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                                <Icon size={17} />
                                {label}
                            </div>
                            {showBadge && (
                                <span style={{
                                    padding: '2px 6px', borderRadius: 10, fontSize: 10, fontWeight: 800,
                                    background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)',
                                }}>
                                    🔴 LIVE
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                {/* Token + Wallet row */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 2 }}>
                    <Link href={route('tokens.index')} style={{ flex: 1, textDecoration: 'none' }}>
                        <div style={{ padding: '9px 12px', borderRadius: 12, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.22)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                            <span style={{ fontSize: 13 }}>🪙</span>
                            <span style={{ color: '#fcd34d', fontSize: 13, fontWeight: 700 }}>{auth.user?.token_balance ?? 0}</span>
                            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>Token</span>
                        </div>
                    </Link>
                    <Link href={route('wallet.index')} style={{ flex: 1, textDecoration: 'none' }}>
                        <div style={{ padding: '9px 12px', borderRadius: 12, background: 'rgba(77,111,255,0.12)', border: '1px solid rgba(77,111,255,0.22)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                            <Wallet size={13} style={{ color: '#93b4ff' }} />
                            <span style={{ color: '#93b4ff', fontSize: 13, fontWeight: 700 }}>৳{parseFloat(auth.user?.wallet_balance ?? 0).toFixed(0)}</span>
                            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>ওয়ালেট</span>
                        </div>
                    </Link>
                </div>

                {/* Admin panel */}
                {auth.user?.role === 'ADMIN' && (
                    <Link href={route('admin.dashboard')} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 12,
                        background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)',
                        color: '#fcd34d', fontSize: 13, fontWeight: 600, textDecoration: 'none',
                    }}>
                        <Settings size={15} /> অ্যাডমিন প্যানেল
                    </Link>
                )}

                {/* Logout */}
                <Link href={route('logout')} method="post" as="button" style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 12,
                    background: 'transparent', border: 'none', color: 'rgba(239,68,68,0.75)',
                    fontSize: 13, fontWeight: 500, cursor: 'pointer', textDecoration: 'none', width: '100%',
                }}>
                    <LogOut size={15} /> লগ আউট
                </Link>
            </div>
        </aside>
    );
}

// ── Main Layout ───────────────────────────────────────────────────────────────
export default function MobileLayout({ children, title = '' }) {
    const { auth } = usePage().props;
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { notifications, removeNotification } = useNotifications();
    useFcmAutoRegister();

    return (
        <div style={{ fontFamily: "'Noto Sans Bengali', 'Anek Bangla', 'Inter', sans-serif" }}>

            {/* ── DESKTOP LAYOUT (lg+) ────────────────────────────────────── */}
            <div className="hidden lg:flex" style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#05071a 0%,#0a0e23 60%,#0f1730 100%)' }}>
                <DesktopSidebar auth={auth} />
                <main style={{ marginLeft: 240, flex: 1, minHeight: '100vh', padding: '32px 36px', overflowY: 'auto' }}>
                    {title && (
                        <h1 style={{ color: 'white', fontWeight: 800, fontSize: 22, marginBottom: 24 }}>{title}</h1>
                    )}
                    {children}
                </main>
                <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
            </div>

            {/* ── MOBILE LAYOUT ───────────────────────────────────────────── */}
            <div className="flex lg:hidden" style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0e23 0%,#0f1a3e 50%,#0a1628 100%)' }}>
                <div style={{ width: '100%' }}>

                    {/* Top App Bar */}
                    <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14"
                        style={{ paddingTop: 'env(safe-area-inset-top,0px)', background: 'rgba(8,11,28,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <motion.button whileTap={{ scale: 0.88 }} onClick={() => setDrawerOpen(true)} className="touch-target rounded-xl" aria-label="মেনু">
                            <Menu size={22} className="text-white/80" />
                        </motion.button>

                        <Link href={route('dashboard')}>
                            <img src="/logo.png?v=1" alt="Exam Arena" style={{ height: 30, objectFit: 'contain' }} />
                        </Link>

                        <div className="flex items-center gap-1.5">
                            {/* Token */}
                            <Link href={route('tokens.index')} className="touch-target rounded-xl">
                                <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold"
                                    style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fcd34d' }}>
                                    🪙 {auth.user?.token_balance ?? 0}
                                </div>
                            </Link>
                            {/* Wallet */}
                            <Link href={route('wallet.index')} className="touch-target rounded-xl">
                                <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold"
                                    style={{ background: 'rgba(77,111,255,0.15)', border: '1px solid rgba(77,111,255,0.3)', color: '#93b4ff' }}>
                                    <Wallet size={12} />
                                    ৳{parseFloat(auth.user?.wallet_balance ?? 0).toFixed(0)}
                                </div>
                            </Link>
                        </div>
                    </header>

                    {/* Slide-out Drawer */}
                    <AnimatePresence>
                        {drawerOpen && (
                            <>
                                <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    onClick={() => setDrawerOpen(false)}
                                    className="fixed inset-0 z-50"
                                    style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
                                <motion.aside key="drawer"
                                    initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                                    transition={{ type: 'spring', stiffness: 380, damping: 38 }}
                                    className="fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col overflow-y-auto"
                                    style={{ background: 'rgba(8,11,28,0.98)', backdropFilter: 'blur(30px)', borderRight: '1px solid rgba(255,255,255,0.08)', paddingTop: 'env(safe-area-inset-top,0px)', paddingBottom: 'calc(env(safe-area-inset-bottom,0px) + 80px)' }}>

                                    <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                                        <img src="/logo.png?v=1" alt="Exam Arena" style={{ height: 32, objectFit: 'contain' }} />
                                        <motion.button whileTap={{ scale: 0.88 }} onClick={() => setDrawerOpen(false)}>
                                            <X size={20} className="text-white/50" />
                                        </motion.button>
                                    </div>

                                    {/* User info */}
                                    <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                                style={{ background: 'linear-gradient(135deg,#4d6fff,#7c3aed)' }}>
                                                {auth.user?.name?.[0]?.toUpperCase() ?? 'U'}
                                            </div>
                                            <div>
                                                <div className="text-white font-semibold text-sm">{auth.user?.name}</div>
                                                <div className="text-white/40 text-xs">{auth.user?.email}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <nav className="flex-1 px-3 mt-3 space-y-1 overflow-y-auto">
                                        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                                            const isExamLink = href === 'exams.index';
                                            const showBadge  = isExamLink && !!usePage().props.hasActiveContest;

                                            return (
                                                <Link key={href} href={route(href)} onClick={() => setDrawerOpen(false)}
                                                    className="block rounded-xl"
                                                    style={{ minHeight: '44px' }}>
                                                    <div className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium"
                                                        style={{ color: 'rgba(255,255,255,0.65)' }}>
                                                        <div className="flex items-center gap-3">
                                                            <Icon size={18} />
                                                            <span>{label}</span>
                                                        </div>
                                                        {showBadge && (
                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/40 flex items-center gap-1 animate-pulse">
                                                                🔴 LIVE
                                                            </span>
                                                        )}
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </nav>

                                    <div className="px-4 mt-auto space-y-1 pb-4">
                                        {auth.user?.role === 'ADMIN' && (
                                            <Link href={route('admin.dashboard')} onClick={() => setDrawerOpen(false)}
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
                                                style={{ background: 'rgba(245,158,11,0.15)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.25)' }}>
                                                <Settings size={16} /> অ্যাডমিন প্যানেল
                                            </Link>
                                        )}
                                        <Link href={route('logout')} method="post" as="button" onClick={() => setDrawerOpen(false)}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
                                            style={{ color: 'rgba(239,68,68,0.8)' }}>
                                            <LogOut size={16} /> লগ আউট
                                        </Link>
                                    </div>
                                </motion.aside>
                            </>
                        )}
                    </AnimatePresence>

                    {/* Page Content */}
                    <main className="pb-20" style={{ paddingTop: 'calc(3.5rem + env(safe-area-inset-top,0px))' }}>
                        {children}
                    </main>

                    <BottomNav />
                    <ChatbotWidget />
                    <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
                </div>
            </div>
        </div>
    );
}
