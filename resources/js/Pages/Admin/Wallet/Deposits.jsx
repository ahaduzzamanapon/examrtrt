import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Search, ArrowDownCircle } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';

const METHOD_COLOR = { bkash: '#e91e8c', nagad: '#f26722', rocket: '#8b2fc9' };

function StatusBadge({ status }) {
    const st = String(status).toLowerCase();
    const cfg = {
        pending:  { label: '⏳ পেন্ডিং',  color: '#f59e0b', bg: 'rgba(245,158,11,0.2)' },
        approved: { label: '✓ Approved', color: '#10b981', bg: 'rgba(16,185,129,0.2)' },
        rejected: { label: '✕ Rejected', color: '#ef4444', bg: 'rgba(239,68,68,0.2)' },
    }[st] ?? { label: status, color: '#888', bg: 'rgba(255,255,255,0.1)' };

    return (
        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40` }}>
            {cfg.label}
        </span>
    );
}


export default function AdminDeposits({ deposits }) {
    const list = deposits?.data ?? deposits ?? [];
    const [filter, setFilter] = useState('ALL');
    const [search, setSearch] = useState('');

    const approve = (id) => {
        Swal.fire({
            title: 'অনুমোদন নিশ্চিতকরণ',
            text: 'এই ডিপোজিট টি কি অনুমোদন করতে চান?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'হ্যাঁ, অনুমোদন করুন',
            cancelButtonText: 'বাতিল',
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.wallet.deposits.approve', id));
            }
        });
    };

    const reject  = (id) => {
        Swal.fire({
            title: 'ডিপোজিট বাতিল',
            input: 'text',
            inputLabel: 'বাতিল করার কারণ (ঐচ্ছিক):',
            inputValue: 'Rejected by admin',
            showCancelButton: true,
            confirmButtonText: 'বাতিল করুন',
            confirmButtonColor: '#ef4444',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.wallet.deposits.reject', id), { note: result.value ?? 'Rejected by admin' });
            }
        });
    };

    const filteredList = list.filter(tx => {
        const st = String(tx.status).toLowerCase();
        if (filter !== 'ALL' && st !== filter.toLowerCase()) return false;
        if (search) {
            const q = search.toLowerCase();
            return (tx.trx_id?.toLowerCase().includes(q) || tx.payment_number?.includes(q) || tx.user?.name?.toLowerCase().includes(q) || tx.user?.email?.toLowerCase().includes(q));
        }
        return true;
    });

    return (
        <AdminLayout title="Deposits">
            <Head title="ডিপোজিট ম্যানেজমেন্ট — Admin" />

            <div style={{ padding: '16px 20px', maxWidth: 900, margin: '0 auto' }}>
                <div style={{ marginBottom: 20 }}>
                    <h1 style={{ color: 'white', fontWeight: 800, fontSize: 22, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ArrowDownCircle color="#34d399" /> ডিপোজিট ম্যানেজমেন্ট
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 4 }}>
                        পেন্ডিং ডিপোজিট অনুমোদন বা বাতিল করুন
                    </p>
                </div>

                {/* Filter Tabs & Search */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
                            <button
                                key={st}
                                onClick={() => setFilter(st)}
                                style={{
                                    padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                                    background: filter === st ? '#4d6fff' : 'rgba(255,255,255,0.06)',
                                    color: filter === st ? 'white' : 'rgba(255,255,255,0.6)',
                                    fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap',
                                }}
                            >
                                {st === 'ALL' ? 'সবগুলো' : st === 'PENDING' ? '⏳ পেন্ডিং' : st === 'APPROVED' ? '✓ অনুমোদিত' : '✕ বাতিল'}
                            </button>
                        ))}
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                        <input
                            type="text"
                            placeholder="TrxID, ফোন বা ইমেইল দিয়ে খুঁজুন..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{
                                width: '100%', padding: '10px 12px 10px 38px', borderRadius: 12,
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white', fontSize: 13, outline: 'none', boxSizing: 'border-box',
                            }}
                        />
                    </div>
                </div>

                {filteredList.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 16, color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                        কোনো ডিপোজিট রেকর্ড পাওয়া যায়নি ✅
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {filteredList.map((tx, i) => {
                            const isPending = String(tx.status).toLowerCase() === 'pending';
                            return (
                                <motion.div key={tx.id}
                                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.02 }}
                                    style={{
                                        padding: '16px 18px', borderRadius: 16,
                                        background: isPending ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.03)',
                                        border: isPending ? '1.5px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.08)',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                                <StatusBadge status={tx.status} />
                                                <span style={{
                                                    padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 800,
                                                    background: `${METHOD_COLOR[tx.payment_method?.toLowerCase()] ?? '#888'}22`,
                                                    color: METHOD_COLOR[tx.payment_method?.toLowerCase()] ?? '#888',
                                                }}>
                                                    {tx.payment_method?.toUpperCase()}
                                                </span>
                                            </div>
                                            <div style={{ color: '#34d399', fontWeight: 900, fontSize: 20 }}>
                                                ৳{parseFloat(tx.gross_amount).toFixed(2)}
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ color: '#93b4ff', fontWeight: 800, fontSize: 13 }}>
                                                TrxID: {tx.trx_id}
                                            </div>
                                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 }}>
                                                From: <strong>{tx.payment_number}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.2)', marginBottom: isPending ? 12 : 0 }}>
                                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600 }}>
                                            👤 {tx.user?.name} ({tx.user?.email})
                                        </div>
                                        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 }}>
                                            🕒 {new Date(tx.created_at).toLocaleString('bn-BD')}
                                        </div>
                                        {tx.admin_note && (
                                            <div style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>
                                                নোট: {tx.admin_note}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons — Full Width on Mobile */}
                                    {isPending && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                            <button
                                                onClick={() => approve(tx.id)}
                                                style={{
                                                    padding: '11px', borderRadius: 12, border: 'none',
                                                    background: 'linear-gradient(135deg,#10b981,#059669)',
                                                    color: 'white', fontWeight: 800, fontSize: 13, cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                                    boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                                                }}
                                            >
                                                <CheckCircle size={16} /> অনুমোদন করুন
                                            </button>
                                            <button
                                                onClick={() => reject(tx.id)}
                                                style={{
                                                    padding: '11px', borderRadius: 12, border: 'none',
                                                    background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)',
                                                    color: '#f87171', fontWeight: 800, fontSize: 13, cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                                }}
                                            >
                                                <XCircle size={16} /> বাতিল করুন
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
