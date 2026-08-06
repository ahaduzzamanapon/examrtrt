import { usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { Bell, Users, FileText, TrendingUp, ChevronRight } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

const QUICK_LINKS = [
    {
        href: 'admin.notifications',
        icon: Bell,
        color: '#4d6fff',
        bg: 'rgba(77,111,255,0.15)',
        title: 'Push Notifications',
        desc: 'সব বা নির্দিষ্ট শিক্ষার্থীদের notification পাঠাও',
    },
    // Future admin features:
    // { href: 'admin.users', icon: Users, color: '#10b981', bg: 'rgba(16,185,129,0.15)', title: 'Users', desc: 'Manage students' },
    // { href: 'admin.exams', icon: FileText, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', title: 'Exams', desc: 'Create & manage exams' },
];

function StatCard({ label, value, icon: Icon, color }) {
    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{
                padding: '20px 22px', borderRadius: 16,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', gap: 14,
            }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} style={{ color }} />
            </div>
            <div>
                <div style={{ fontSize: 24, fontWeight: 900, color: 'white', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{label}</div>
            </div>
        </motion.div>
    );
}

export default function AdminDashboard({ stats }) {
    const { auth } = usePage().props;

    return (
        <AdminLayout title="Dashboard">
            <div style={{ maxWidth: 900 }}>

                {/* Welcome */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 28 }}>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>স্বাগতম,</p>
                    <h1 style={{ color: 'white', fontWeight: 900, fontSize: 26, marginTop: 2 }}>
                        {auth.user?.name} 👋
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 4 }}>
                        এটি তোমার Admin Control Panel। এখান থেকে সব manage করো।
                    </p>
                </motion.div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 32 }}>
                    <StatCard label="মোট ব্যবহারকারী" value={stats?.total_users ?? 0}       icon={Users}      color="#4d6fff" />
                    <StatCard label="FCM Subscribers"  value={stats?.fcm_subscribers ?? 0}    icon={Bell}       color="#10b981" />
                    <StatCard label="মোট পরীক্ষা"     value={stats?.total_exams ?? 0}         icon={FileText}   color="#f59e0b" />
                    <StatCard label="আজকের লগইন"      value={stats?.today_logins ?? 0}        icon={TrendingUp} color="#a78bfa" />
                </div>

                {/* Quick Actions */}
                <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 12 }}>
                        Quick Actions
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                        {QUICK_LINKS.map(({ href, icon: Icon, color, bg, title, desc }) => (
                            <motion.div key={href} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
                                <Link href={route(href)} style={{ textDecoration: 'none', display: 'block' }}>
                                    <div style={{
                                        padding: '18px 20px', borderRadius: 16,
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        display: 'flex', alignItems: 'center', gap: 14,
                                        transition: 'border-color 0.15s',
                                        cursor: 'pointer',
                                    }}>
                                        <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Icon size={20} style={{ color }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>{title}</div>
                                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 3 }}>{desc}</div>
                                        </div>
                                        <ChevronRight size={16} style={{ color: 'rgba(255,255,255,0.2)' }} />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
