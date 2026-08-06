import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Bell, Users, FileText,
    Settings, LogOut, ChevronRight, Menu, X, Zap, Wallet, ArrowDownCircle, ArrowUpCircle,
} from 'lucide-react';

const ADMIN_NAV = [
    { href: 'admin.dashboard',          icon: LayoutDashboard, label: 'Dashboard' },
    { href: 'admin.notifications',      icon: Bell,            label: 'Notifications' },
    { href: 'admin.users',              icon: Users,           label: 'Users' },
    { href: 'admin.questions',          icon: FileText,        label: 'Questions' },
    { href: 'admin.exams.index',        icon: Zap,             label: 'Exams' },
    { href: 'admin.wallet.deposits',    icon: ArrowDownCircle, label: 'Deposits' },
    { href: 'admin.wallet.withdrawals', icon: ArrowUpCircle,   label: 'Withdrawals' },
    { href: 'admin.settings',           icon: Settings,        label: 'Settings' },
];

function Sidebar({ mobile = false, onClose }) {
    const { url } = usePage();

    return (
        <div style={{
            width: mobile ? '100%' : 220,
            display: 'flex', flexDirection: 'column',
            height: '100%', padding: '20px 10px',
        }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 10, marginBottom: 28 }}>
                <div>
                    <img src="/logo.png" alt="Exam Arena" style={{ height: 34, objectFit: 'contain' }} />
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2, paddingLeft: 2 }}>Admin Panel</div>
                </div>
                {mobile && (
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 10px', marginBottom: 6 }}>
                    Main
                </div>
                {ADMIN_NAV.map(({ href, icon: Icon, label }) => {
                    const routeUrl = route(href);
                    const path = new URL(routeUrl, window.location.origin).pathname;
                    const isActive = href === 'admin.dashboard'
                        ? (url === path || url === '/admin' || url === '/admin/')
                        : url.startsWith(path);

                    return (
                        <Link key={href} href={route(href)} onClick={onClose}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '9px 12px', borderRadius: 10,
                                background: isActive ? 'rgba(77,111,255,0.2)' : 'transparent',
                                border: `1px solid ${isActive ? 'rgba(77,111,255,0.35)' : 'transparent'}`,
                                color: isActive ? '#93b4ff' : 'rgba(255,255,255,0.55)',
                                fontWeight: isActive ? 700 : 400,
                                fontSize: 13.5, textDecoration: 'none',
                                transition: 'all 0.15s',
                            }}>
                            <Icon size={16} />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Link href={route('dashboard')} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10,
                    color: 'rgba(255,255,255,0.4)', fontSize: 13, textDecoration: 'none',
                }}>
                    <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> Student View
                </Link>
                <Link href={route('logout')} method="post" as="button" style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10,
                    background: 'none', border: 'none', color: 'rgba(239,68,68,0.65)',
                    fontSize: 13, cursor: 'pointer', width: '100%',
                }}>
                    <LogOut size={14} /> Logout
                </Link>
            </div>
        </div>
    );
}

export default function AdminLayout({ children, title = 'Admin' }) {
    const { auth } = usePage().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <Head title={`${title} — Admin`} />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: 'Inter', sans-serif; }
            `}</style>

            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(160deg,#060a1a 0%,#0c1025 60%,#0a0e20 100%)',
                fontFamily: "'Inter',sans-serif",
                color: '#e2e8f0',
                display: 'flex',
            }}>

                {/* ── Desktop Sidebar ───────────────────────────────────── */}
                <aside className="hidden lg:flex" style={{
                    width: 220, flexShrink: 0,
                    position: 'fixed', top: 0, left: 0, bottom: 0,
                    background: 'rgba(8,12,28,0.95)',
                    borderRight: '1px solid rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(20px)',
                    flexDirection: 'column',
                    zIndex: 40,
                }}>
                    <Sidebar onClose={() => {}} />
                </aside>

                {/* ── Mobile Sidebar ────────────────────────────────────── */}
                {mobileMenuOpen && (
                    <div className="lg:hidden" style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
                        <div onClick={() => setMobileMenuOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />
                        <motion.div initial={{ x: -220 }} animate={{ x: 0 }} exit={{ x: -220 }}
                            style={{
                                position: 'absolute', top: 0, left: 0, bottom: 0, width: 220,
                                background: 'rgba(8,12,28,0.99)',
                                borderRight: '1px solid rgba(255,255,255,0.07)',
                            }}>
                            <Sidebar mobile onClose={() => setMobileMenuOpen(false)} />
                        </motion.div>
                    </div>
                )}

                {/* ── Main content ──────────────────────────────────────── */}
                <div className="lg:ml-[220px]" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

                    {/* Top bar */}
                    <header style={{
                        height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0 24px',
                        background: 'rgba(8,12,28,0.8)',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        backdropFilter: 'blur(12px)',
                        position: 'sticky', top: 0, zIndex: 30,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button className="lg:hidden" onClick={() => setMobileMenuOpen(true)}
                                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
                                <Menu size={20} />
                            </button>
                            <div>
                                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>Admin /</span>
                                <span style={{ color: 'white', fontWeight: 600, fontSize: 14, marginLeft: 6 }}>{title}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{auth.user?.email}</div>
                            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#4d6fff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: 'white' }}>
                                {auth.user?.name?.[0]?.toUpperCase() ?? 'A'}
                            </div>
                        </div>
                    </header>

                    {/* Page content */}
                    <main style={{ flex: 1, padding: '28px 28px' }}>
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}
