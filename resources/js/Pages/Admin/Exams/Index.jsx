import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Plus, Zap, Clock, CheckCircle, XCircle, Edit, Trash2, PlayCircle } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';

const STATUS_CONFIG = {
    SCHEDULED: { label: 'শিডিউলড',  color: '#4d6fff', bg: 'rgba(77,111,255,0.15)'  },
    LIVE:      { label: 'লাইভ',      color: '#10b981', bg: 'rgba(16,185,129,0.15)'  },
    COMPLETED: { label: 'সম্পন্ন',  color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
};

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] ?? { label: status, color: '#888', bg: 'rgba(128,128,128,0.15)' };
    return (
        <span style={{
            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40`,
        }}>
            {cfg.label}
        </span>
    );
}

export default function ExamsIndex({ exams }) {
    const list = exams?.data ?? exams ?? [];

    const goLive = (id) => {
        Swal.fire({
            title: 'পরীক্ষা LIVE শুরু',
            text: 'এই পরীক্ষাটি LIVE করতে চাও?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'হ্যাঁ, LIVE করো',
            cancelButtonText: 'বাতিল',
            confirmButtonColor: '#10b981',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.exams.live', id));
            }
        });
    };

    const destroy = (id) => {
        Swal.fire({
            title: 'পরীক্ষা ডিলেট',
            text: 'এই পরীক্ষাটি মুছে ফেলতে চাও?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'হ্যাঁ, মুছে ফেলো',
            cancelButtonText: 'বাতিল',
            confirmButtonColor: '#ef4444',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.exams.destroy', id));
            }
        });
    };

    return (
        <AdminLayout title="Exams">
            <Head title="Exams — Admin" />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 style={{ color: 'white', fontWeight: 800, fontSize: 22, margin: 0 }}>পরীক্ষা ব্যবস্থাপনা</h1>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 4 }}>
                        মোট {list.length} টি পরীক্ষা
                    </p>
                </div>
                <Link href={route('admin.exams.create')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px',
                        borderRadius: 12, background: 'linear-gradient(135deg,#4d6fff,#7c3aed)',
                        color: 'white', fontWeight: 700, fontSize: 13, textDecoration: 'none',
                    }}
                >
                    <Plus size={15} /> নতুন পরীক্ষা
                </Link>
            </div>

            {/* List */}
            {list.length === 0 ? (
                <div style={{
                    padding: '60px 20px', textAlign: 'center',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16,
                }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>এখনো কোনো পরীক্ষা তৈরি হয়নি</p>
                    <Link href={route('admin.exams.create')}
                        style={{ display: 'inline-block', marginTop: 16, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#4d6fff,#7c3aed)', color: 'white', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}
                    >
                        + নতুন পরীক্ষা তৈরি করো
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {list.map((exam, i) => (
                        <motion.div key={exam.id}
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            style={{
                                padding: '18px 20px', borderRadius: 16,
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                                        <StatusBadge status={exam.status} />
                                        <span style={{
                                            padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                                            background: exam.type === 'PAID' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.12)',
                                            color: exam.type === 'PAID' ? '#fcd34d' : '#34d399',
                                            border: `1px solid ${exam.type === 'PAID' ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}`,
                                        }}>
                                            {exam.type === 'PAID' ? `৳${exam.entry_fee} PAID` : 'FREE'}
                                        </span>
                                    </div>
                                    <div style={{ color: 'white', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                                        {exam.title}
                                    </div>
                                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                                        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
                                            <Clock size={11} style={{ display: 'inline', marginRight: 4 }} />
                                            {new Date(exam.scheduled_at).toLocaleString('bn-BD', { dateStyle: 'short', timeStyle: 'short' })}
                                        </span>
                                        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
                                            ⏱ {exam.duration_minutes} মিনিট
                                        </span>
                                        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
                                            👥 {exam.submissions_count ?? 0} জন
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                                    {exam.status === 'SCHEDULED' && (
                                        <button onClick={() => goLive(exam.id)}
                                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: 'none', background: 'rgba(16,185,129,0.2)', color: '#34d399', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                                            <PlayCircle size={13} /> LIVE
                                        </button>
                                    )}
                                    {exam.status !== 'COMPLETED' && (
                                        <Link href={route('admin.exams.edit', exam.id)}
                                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 12, textDecoration: 'none' }}>
                                            <Edit size={12} /> Edit
                                        </Link>
                                    )}
                                    {exam.status !== 'LIVE' && (
                                        <button onClick={() => destroy(exam.id)}
                                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: 'none', background: 'rgba(239,68,68,0.12)', color: '#f87171', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                                            <Trash2 size={12} /> Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
