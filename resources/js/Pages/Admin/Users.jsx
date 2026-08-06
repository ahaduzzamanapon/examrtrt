import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, Shield, Bell, Trash2, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Edit3, X, Coins } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';

const GOAL_LABELS = {
    bcs: 'BCS', hsc: 'HSC', ssc: 'SSC', medical: 'Medical',
    engineering: 'Engineering', bank: 'Bank', university: 'University',
    primary: 'Primary', other: 'Other',
};

function RoleBadge({ role }) {
    const isAdmin = role === 'ADMIN';
    return (
        <span style={{
            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            background: isAdmin ? 'rgba(245,158,11,0.15)' : 'rgba(77,111,255,0.12)',
            color: isAdmin ? '#fcd34d' : '#93b4ff',
            border: `1px solid ${isAdmin ? 'rgba(245,158,11,0.3)' : 'rgba(77,111,255,0.25)'}`,
        }}>
            {isAdmin ? '👑 Admin' : '🎓 Student'}
        </span>
    );
}

function EditTokenModal({ user, onClose }) {
    const [val, setVal] = useState(String(user.token_balance));
    const save = () => {
        router.patch(route('admin.users.tokens', user.id), { tokens: parseInt(val) }, { onSuccess: onClose });
    };
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                style={{ background: '#0c1025', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: 24, width: 300 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ color: 'white', fontWeight: 700 }}>🪙 Token সম্পাদনা</span>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={16} /></button>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 10 }}>{user.name}</div>
                <input type="number" value={val} onChange={e => setVal(e.target.value)} min="0" max="99999"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 15, outline: 'none', marginBottom: 14 }} />
                <button onClick={save} style={{ width: '100%', padding: '10px', borderRadius: 10, background: 'linear-gradient(135deg,#4d6fff,#7c3aed)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                    সেভ করো
                </button>
            </motion.div>
        </div>
    );
}

export default function AdminUsers({ users, search: initSearch, stats }) {
    const { flash } = usePage().props;
    const [search, setSearch]       = useState(initSearch ?? '');
    const [editToken, setEditToken]  = useState(null); // user obj
    const [deleteId, setDeleteId]    = useState(null);

    const doSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.users'), { search }, { preserveState: true });
    };


    const changeRole = (user) => {
        const newRole = user.role === 'ADMIN' ? 'STUDENT' : 'ADMIN';
        Swal.fire({
            title: 'রোল পরিবর্তন',
            text: `${user.name} কে ${newRole} বানাতে চাও?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'হ্যাঁ, পরিবর্তন করো',
            cancelButtonText: 'বাতিল',
            confirmButtonColor: '#f59e0b',
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(route('admin.users.role', user.id), { role: newRole });
            }
        });
    };

    const doDelete = (user) => {
        Swal.fire({
            title: 'ইউজার ডিলেট',
            text: `${user.name} কে মুছে ফেলতে চাও?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'হ্যাঁ, মুছে ফেলো',
            cancelButtonText: 'বাতিল',
            confirmButtonColor: '#ef4444',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.users.destroy', user.id));
            }
        });
    };

    const s = { color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '10px 14px', textAlign: 'left' };

    return (
        <AdminLayout title="Users">
            <Head title="Users — Admin" />

            {editToken && <EditTokenModal user={editToken} onClose={() => setEditToken(null)} />}

            {/* Flash */}
            <AnimatePresence>
                {flash?.success && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', marginBottom: 18, fontSize: 13 }}>
                        <CheckCircle size={14} /> {flash.success}
                    </motion.div>
                )}
                {flash?.error && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', marginBottom: 18, fontSize: 13 }}>
                        <AlertCircle size={14} /> {flash.error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 22 }}>
                {[
                    { label: 'মোট User', value: stats.total, color: '#4d6fff', icon: '👥' },
                    { label: 'Admin', value: stats.admins, color: '#fcd34d', icon: '👑' },
                    { label: 'FCM Subscribed', value: stats.fcm, color: '#10b981', icon: '🔔' },
                ].map(s => (
                    <div key={s.label} style={{ padding: '14px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', minWidth: 110 }}>
                        <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>{s.icon} {s.label}</div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <form onSubmit={doSearch} style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
                    <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="নাম বা ইমেইল খোঁজো..."
                        style={{ width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: 9, paddingBottom: 9, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13, outline: 'none' }} />
                </div>
                <button type="submit" style={{ padding: '9px 16px', borderRadius: 10, background: 'rgba(77,111,255,0.2)', border: '1px solid rgba(77,111,255,0.3)', color: '#93b4ff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    খুঁজো
                </button>
            </form>

            {/* Table */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <th style={s}>User</th>
                            <th style={s}>Role</th>
                            <th style={{ ...s, textAlign: 'center' }}>🪙 Token</th>
                            <th style={{ ...s, textAlign: 'center' }}>🔔 FCM</th>
                            <th style={s}>পরীক্ষার লক্ষ্য</th>
                            <th style={{ ...s, textAlign: 'center' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.data.map((user, i) => (
                            <motion.tr key={user.id}
                                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <td style={{ padding: '12px 14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#4d6fff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: 'white', flexShrink: 0 }}>
                                            {user.name?.[0]?.toUpperCase() ?? 'U'}
                                        </div>
                                        <div>
                                            <div style={{ color: 'white', fontWeight: 600, fontSize: 13 }}>{user.name}</div>
                                            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '12px 14px' }}>
                                    <RoleBadge role={user.role} />
                                </td>
                                <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                    <button onClick={() => setEditToken(user)}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#fcd34d', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                                        {user.token_balance} <Edit3 size={10} />
                                    </button>
                                </td>
                                <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                    <span style={{ fontSize: 16 }}>{user.has_fcm ? '✅' : '❌'}</span>
                                </td>
                                <td style={{ padding: '12px 14px' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                        {Array.isArray(user.exam_goal) && user.exam_goal.length > 0
                                            ? user.exam_goal.map(g => (
                                                <span key={g} style={{ padding: '2px 8px', borderRadius: 10, background: 'rgba(77,111,255,0.1)', color: '#93b4ff', fontSize: 10, fontWeight: 600 }}>
                                                    {GOAL_LABELS[g] ?? g}
                                                </span>
                                            ))
                                            : <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>—</span>
                                        }
                                    </div>
                                </td>
                                <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                        <button onClick={() => changeRole(user)} title="Role পরিবর্তন"
                                            style={{ padding: '5px 10px', borderRadius: 8, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#fcd34d', fontSize: 11, cursor: 'pointer' }}>
                                            <Shield size={13} />
                                        </button>
                                        <button onClick={() => doDelete(user)} title="মুছে ফেলো"
                                            style={{ padding: '5px 10px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 11, cursor: 'pointer' }}>
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>

                {users.data.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
                        কোনো user পাওয়া যায়নি।
                    </div>
                )}
            </div>

            {/* Pagination */}
            {users.last_page > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
                    {users.prev_page_url && (
                        <Link href={users.prev_page_url} style={{ padding: '7px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <ChevronLeft size={14} /> আগে
                        </Link>
                    )}
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
                        {users.current_page} / {users.last_page}
                    </span>
                    {users.next_page_url && (
                        <Link href={users.next_page_url} style={{ padding: '7px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                            পরে <ChevronRight size={14} />
                        </Link>
                    )}
                </div>
            )}
        </AdminLayout>
    );
}
