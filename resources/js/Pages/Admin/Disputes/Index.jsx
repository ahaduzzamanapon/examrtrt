import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Flag, CheckCircle2, XCircle, Clock, Send, Eye } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function AdminDisputesIndex({ disputes, currentStatus = 'PENDING' }) {
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [status, setStatus] = useState('RESOLVED');
    const [adminNote, setAdminNote] = useState('');
    const [processing, setProcessing] = useState(false);

    const changeFilter = (st) => {
        router.get(route('admin.disputes.index'), { status: st }, { preserveState: true });
    };

    const handleUpdateStatus = (e) => {
        e.preventDefault();
        if (!selectedDispute) return;
        setProcessing(true);

        router.post(route('admin.disputes.update', selectedDispute.id), {
            status: status,
            admin_note: adminNote,
        }, {
            onFinish: () => {
                setProcessing(false);
                setSelectedDispute(null);
                setAdminNote('');
            }
        });
    };

    return (
        <AdminLayout title="প্রশ্ন রিপোর্ট ম্যানেজমেন্ট">
            <Head title="প্রশ্ন রিপোর্ট — Admin" />

            <div style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }}>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                    {['PENDING', 'RESOLVED', 'REJECTED', 'ALL'].map((st) => (
                        <button
                            key={st}
                            onClick={() => changeFilter(st)}
                            style={{
                                padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                                background: currentStatus === st ? '#4d6fff' : 'rgba(255,255,255,0.06)',
                                color: currentStatus === st ? 'white' : 'rgba(255,255,255,0.6)',
                                fontWeight: 700, fontSize: 13,
                            }}
                        >
                            {st === 'PENDING' ? '⏳ পেন্ডিং' : st === 'RESOLVED' ? '✓ সমাধানকৃত' : st === 'REJECTED' ? '✕ বাতিল' : 'সবগুলো'}
                        </button>
                    ))}
                </div>

                {/* Disputes List */}
                {disputes.data.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 16, color: 'rgba(255,255,255,0.4)' }}>
                        কোনো প্রশ্ন রিপোর্ট পাওয়া যায়নি।
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {disputes.data.map((d) => (
                            <div key={d.id} style={{
                                padding: '16px 20px', borderRadius: 16,
                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                        <span style={{
                                            padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 800,
                                            background: d.status === 'RESOLVED' ? 'rgba(16,185,129,0.2)' : d.status === 'REJECTED' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                                            color: d.status === 'RESOLVED' ? '#34d399' : d.status === 'REJECTED' ? '#f87171' : '#fbbf24',
                                        }}>
                                            {d.status}
                                        </span>
                                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                                            রিপোর্টকারী: <strong>{d.user?.name}</strong> ({d.user?.email})
                                        </span>
                                    </div>
                                    <div style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                                        {d.question?.question_text || 'প্রশ্নটি পাওয়া যায়নি'}
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                                        💬 রিপোর্ট: {d.report_reason}
                                    </div>
                                    {d.admin_note && (
                                        <div style={{ color: '#c084fc', fontSize: 12, marginTop: 4 }}>
                                            👑 অ্যাডমিন নোট: {d.admin_note}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => { setSelectedDispute(d); setStatus(d.status === 'PENDING' ? 'RESOLVED' : d.status); setAdminNote(d.admin_note || ''); }}
                                    style={{
                                        padding: '8px 14px', borderRadius: 10, border: 'none',
                                        background: 'linear-gradient(135deg,#4d6fff,#7c3aed)',
                                        color: 'white', fontWeight: 700, fontSize: 12, cursor: 'pointer', flexShrink: 0,
                                    }}
                                >
                                    অ্যাকশন নিন ⚙️
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal for Admin Action */}
                {selectedDispute && (
                    <div style={{
                        position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.75)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
                    }}>
                        <div style={{
                            width: '100%', maxWidth: 440, borderRadius: 20, padding: 24,
                            background: '#0d1127', border: '1px solid rgba(77,111,255,0.3)', color: 'white',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>রিপোর্ট স্ট্যাটাস পরিবর্তন</h3>
                                <button onClick={() => setSelectedDispute(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 20 }}>✕</button>
                            </div>

                            <form onSubmit={handleUpdateStatus} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div>
                                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>স্ট্যাটাস</label>
                                    <select
                                        value={status}
                                        onChange={e => setStatus(e.target.value)}
                                        style={{ width: '100%', padding: '10px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
                                    >
                                        <option value="RESOLVED" style={{ background: '#0f172a' }}>✓ RESOLVED (সমাধানকৃত)</option>
                                        <option value="REJECTED" style={{ background: '#0f172a' }}>✕ REJECTED (বাতিল)</option>
                                        <option value="PENDING" style={{ background: '#0f172a' }}>⏳ PENDING (প্রক্রিয়াধীন)</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>অ্যাডমিন নোট / বার্তা (শিক্ষার্থী দেখতে পাবে)</label>
                                    <textarea
                                        value={adminNote}
                                        onChange={e => setAdminNote(e.target.value)}
                                        placeholder="যেমন: প্রশ্নটি সংশোধন করা হয়েছে, ধন্যবাদ!"
                                        rows={3}
                                        style={{ width: '100%', padding: '10px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', resize: 'none' }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    style={{
                                        padding: '12px', borderRadius: 10, border: 'none',
                                        background: 'linear-gradient(135deg,#10b981,#059669)',
                                        color: 'white', fontWeight: 800, fontSize: 14, cursor: 'pointer', marginTop: 6,
                                    }}
                                >
                                    {processing ? 'সেভ হচ্ছে...' : 'স্ট্যাটাস আপডেট করুন'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
}
