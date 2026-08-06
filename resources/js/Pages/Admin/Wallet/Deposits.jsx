import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

const METHOD_COLOR = { bkash: '#e91e8c', nagad: '#f26722', rocket: '#8b2fc9' };

function StatusBadge({ status }) {
    const cfg = {
        pending:  { label: 'পেন্ডিং',  color: '#f59e0b' },
        approved: { label: 'Approved', color: '#10b981' },
        rejected: { label: 'Rejected', color: '#ef4444' },
    }[status] ?? { label: status, color: '#888' };
    return (
        <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}40` }}>
            {cfg.label}
        </span>
    );
}

export default function AdminDeposits({ deposits }) {
    const list = deposits?.data ?? deposits ?? [];

    const approve = (id) => router.post(route('admin.wallet.deposits.approve', id));
    const reject  = (id) => {
        const note = prompt('Rejection reason (optional):') ?? 'Rejected';
        router.post(route('admin.wallet.deposits.reject', id), { note });
    };

    return (
        <AdminLayout title="Deposits">
            <Head title="Deposit Management" />

            <div style={{ marginBottom: 24 }}>
                <h1 style={{ color: 'white', fontWeight: 800, fontSize: 22, margin: 0 }}>ডিপোজিট ব্যবস্থাপনা</h1>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 4 }}>
                    Pending ডিপোজিট Approve/Reject করো
                </p>
            </div>

            {list.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
                    কোনো পেন্ডিং ডিপোজিট নেই ✅
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {list.map((tx, i) => (
                        <motion.div key={tx.id}
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            style={{
                                padding: '16px 20px', borderRadius: 14,
                                background: 'rgba(255,255,255,0.04)',
                                border: tx.status === 'pending'
                                    ? '1px solid rgba(245,158,11,0.25)'
                                    : '1px solid rgba(255,255,255,0.07)',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                                {/* Left */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                        <StatusBadge status={tx.status} />
                                        <span style={{
                                            padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                                            background: `${METHOD_COLOR[tx.payment_method] ?? '#888'}22`,
                                            color: METHOD_COLOR[tx.payment_method] ?? '#888',
                                        }}>
                                            {tx.payment_method?.toUpperCase()}
                                        </span>
                                    </div>
                                    <div style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>
                                        ৳{parseFloat(tx.gross_amount).toFixed(2)}
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>
                                        TrxID: <span style={{ color: '#93b4ff', fontWeight: 600 }}>{tx.trx_id}</span>
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                                        From: {tx.payment_number}
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 4 }}>
                                        👤 {tx.user?.name} · {tx.user?.email}
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>
                                        {new Date(tx.created_at).toLocaleString('bn-BD')}
                                    </div>
                                    {tx.admin_note && (
                                        <div style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>
                                            Note: {tx.admin_note}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                {tx.status === 'pending' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <motion.button whileTap={{ scale: 0.95 }}
                                            onClick={() => approve(tx.id)}
                                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, border: 'none', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#34d399', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                                            <CheckCircle size={14} /> Approve
                                        </motion.button>
                                        <motion.button whileTap={{ scale: 0.95 }}
                                            onClick={() => reject(tx.id)}
                                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, border: 'none', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                                            <XCircle size={14} /> Reject
                                        </motion.button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
