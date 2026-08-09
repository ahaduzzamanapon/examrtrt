import { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Zap, Plus, Clock, CheckCircle2,
    XCircle, AlertTriangle, ChevronRight, Sparkles, Filter
} from 'lucide-react';
import MobileLayout from '@/Layouts/MobileLayout';

const GOALS = [
    { id: 'bcs',         label: 'BCS প্রিলি',       emoji: '🏛️' },
    { id: 'hsc',         label: 'HSC প্রস্তুতি',    emoji: '📘' },
    { id: 'ssc',         label: 'SSC প্রস্তুতি',    emoji: '📗' },
    { id: 'medical',     label: 'মেডিকেল এডমিশন', emoji: '⚕️' },
    { id: 'engineering', label: 'ইঞ্জিনিয়ারিং',   emoji: '⚙️' },
    { id: 'bank',        label: 'ব্যাংক জব',       emoji: '🏦' },
    { id: 'university',  label: 'ভার্সিটি ক ইউনিট', emoji: '🎓' },
    { id: 'primary',     label: 'প্রাইমারি শিক্ষক', emoji: '✏️' },
    { id: 'ntrca',       label: 'NTRCA শিক্ষক নিবন্ধন', emoji: '📜' },
];

export default function ModelTestIndex({ history = [], tokenBalance = 0, userGoals = ['bcs'], stream = null }) {
    const { errors } = usePage().props;
    const [showCreateModal, setShowCreateModal] = useState(false);

    const form = useForm({
        goal:             userGoals[0] || 'bcs',
        subject:          'all',
        question_count:   20,
        duration_minutes: 20,
        negative_marking: true,
    });

    const handleCreate = (e) => {
        e.preventDefault();
        form.post(route('model-test.store'));
    };

    return (
        <MobileLayout title="মডেল টেস্ট">
            <Head title="মডেল টেস্ট — ExamArena" />

            <div style={{ padding: '16px', maxWidth: 520, margin: '0 auto', paddingBottom: 80 }}>

                {/* Header Banner Card */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(77,111,255,0.25), rgba(124,58,237,0.18))',
                    border: '1px solid rgba(77,111,255,0.3)', borderRadius: 22, padding: '22px 20px',
                    marginBottom: 20, boxShadow: '0 10px 30px rgba(77,111,255,0.15)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div>
                            <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}>
                                ⚡ কাস্টমাইজড এক্সাম
                            </span>
                            <h2 style={{ color: 'white', fontWeight: 900, fontSize: 22, margin: '6px 0 0' }}>
                                মডেল টেস্ট
                            </h2>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>টোকেন ব্যালেন্স</div>
                            <div style={{ color: '#fbbf24', fontWeight: 900, fontSize: 20, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                                ⚡ {tokenBalance}
                            </div>
                        </div>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                        আপনার সুবিধামতো বিষয়, প্রশ্ন সংখ্যা ও সময় নির্ধারণ করে কাস্টম মডেল টেস্ট দিন। প্রতি টেস্টে খরচ <strong style={{ color: '#fbbf24' }}>১০ টোকেন</strong>।
                    </p>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        style={{
                            width: '100%', marginTop: 16, padding: '14px', borderRadius: 14, border: 'none',
                            background: 'linear-gradient(135deg, #4d6fff, #7c3aed)', color: 'white',
                            fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            boxShadow: '0 4px 16px rgba(77,111,255,0.35)',
                        }}
                    >
                        <Plus size={18} /> নতুন মডেল টেস্ট শুরু করো (১০ ⚡)
                    </button>
                </div>

                {errors.tokens && (
                    <div style={{ padding: '12px 14px', borderRadius: 12, marginBottom: 16, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AlertTriangle size={16} />
                        {errors.tokens}
                    </div>
                )}

                {/* History Section */}
                <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ color: 'white', fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileText size={18} color="#93b4ff" /> আমার পরীক্ষা ইতিহাস
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700 }}>
                        মোট {history.length} টি টেস্ট দেওয়া হয়েছে
                    </span>
                </div>

                {history.length === 0 ? (
                    <div style={{
                        padding: '40px 20px', textAlign: 'center', borderRadius: 18,
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                    }}>
                        <div style={{ fontSize: 40, marginBottom: 10 }}>📝</div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>এখনো কোনো মডেল টেস্ট দেননি</div>
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 4 }}>
                            উপরের বাটনে ক্লিক করে প্রথম মডেল টেস্ট শুরু করুন!
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {history.map((t) => (
                            <Link
                                key={t.id}
                                href={t.completed ? route('model-test.result', t.id) : route('model-test.room', t.id)}
                                style={{ textDecoration: 'none' }}
                            >
                                <motion.div
                                    whileHover={{ y: -2 }}
                                    style={{
                                        padding: '16px 18px', borderRadius: 16,
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                            <span style={{
                                                padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800,
                                                background: t.completed ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                                                color: t.completed ? '#34d399' : '#fbbf24',
                                            }}>
                                                {t.completed ? 'সম্পন্ন ✓' : 'চলমান ⏳'}
                                            </span>
                                            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
                                                {new Date(t.created_at).toLocaleDateString('bn-BD')}
                                            </span>
                                        </div>

                                        <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>
                                            {t.title}
                                        </div>
                                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>
                                            {t.question_count} প্রশ্ন · {t.duration_minutes} মিনিট
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 10 }}>
                                        {t.completed && (
                                            <div>
                                                <div style={{ color: '#34d399', fontWeight: 900, fontSize: 16 }}>
                                                    {t.score}/{t.total_marks}
                                                </div>
                                                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>প্রাপ্ত নম্বর</div>
                                            </div>
                                        )}
                                        <ChevronRight size={18} color="rgba(255,255,255,0.3)" />
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                )}

            </div>

            {/* ── CREATE MODEL TEST MODAL ────────────────────────────────────────── */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.75)',
                            backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            style={{
                                width: '100%', maxWidth: 440, borderRadius: 24, padding: 24,
                                background: 'linear-gradient(135deg,rgba(15,20,50,0.98),rgba(20,15,45,0.98))',
                                border: '1px solid rgba(77,111,255,0.3)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                                <div style={{ color: 'white', fontWeight: 900, fontSize: 18 }}>
                                    মডেল টেস্ট সেটআপ
                                </div>
                                <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 20 }}>✕</button>
                            </div>

                            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {/* Select Goal */}
                                <div>
                                    <label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                                        পরীক্ষার ক্যাটাগরি
                                    </label>
                                    <select
                                        value={form.data.goal}
                                        onChange={e => form.setData('goal', e.target.value)}
                                        style={{
                                            width: '100%', padding: '12px', borderRadius: 12,
                                            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                            color: 'white', fontSize: 14, outline: 'none',
                                        }}
                                    >
                                        {GOALS.map(g => (
                                            <option key={g.id} value={g.id} style={{ background: '#0f1432', color: 'white' }}>
                                                {g.emoji} {g.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Question Count */}
                                <div>
                                    <label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                                        প্রশ্ন সংখ্যা
                                    </label>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {[10, 20, 30, 50].map(cnt => (
                                            <button
                                                key={cnt}
                                                type="button"
                                                onClick={() => form.setData('question_count', cnt)}
                                                style={{
                                                    flex: 1, padding: '10px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                                                    border: '1px solid', cursor: 'pointer',
                                                    background: form.data.question_count === cnt ? 'rgba(77,111,255,0.25)' : 'rgba(255,255,255,0.04)',
                                                    borderColor: form.data.question_count === cnt ? '#4d6fff' : 'rgba(255,255,255,0.1)',
                                                    color: form.data.question_count === cnt ? '#93b4ff' : 'rgba(255,255,255,0.6)',
                                                }}
                                            >
                                                {cnt} টি
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Duration */}
                                <div>
                                    <label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                                        সময় (মিনিট)
                                    </label>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {[10, 15, 20, 30, 45].map(dur => (
                                            <button
                                                key={dur}
                                                type="button"
                                                onClick={() => form.setData('duration_minutes', dur)}
                                                style={{
                                                    flex: 1, padding: '10px 4px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                                                    border: '1px solid', cursor: 'pointer',
                                                    background: form.data.duration_minutes === dur ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.04)',
                                                    borderColor: form.data.duration_minutes === dur ? '#7c3aed' : 'rgba(255,255,255,0.1)',
                                                    color: form.data.duration_minutes === dur ? '#c084fc' : 'rgba(255,255,255,0.6)',
                                                }}
                                            >
                                                {dur} মি.
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Negative Marking Toggle */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: 12 }}>
                                    <div>
                                        <div style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>নেগেটিভ মার্কিং (0.25)</div>
                                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>ভুল উত্তরের জন্য ০.২৫ নম্বর কাটা যাবে</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={form.data.negative_marking}
                                        onChange={e => form.setData('negative_marking', e.target.checked)}
                                        style={{ width: 18, height: 18, cursor: 'pointer' }}
                                    />
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    type="submit"
                                    disabled={form.processing}
                                    style={{
                                        padding: '14px', borderRadius: 14, border: 'none',
                                        background: 'linear-gradient(135deg,#4d6fff,#7c3aed)',
                                        color: 'white', fontWeight: 800, fontSize: 15, cursor: 'pointer',
                                        marginTop: 8, boxShadow: '0 6px 20px rgba(77,111,255,0.35)',
                                    }}
                                >
                                    {form.processing ? 'প্রসেস হচ্ছে...' : '১০ ⚡ টোকেন খরচ করে শুরু করো'}
                                </motion.button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </MobileLayout>
    );
}
