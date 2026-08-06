import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, AlertCircle, PlayCircle, Trophy, CheckCircle } from 'lucide-react';
import MobileLayout from '@/Layouts/MobileLayout';

const GOAL_DETAILS = {
    bcs:         { name: 'BCS প্রিলি',       emoji: '🏛️', color: '#4d6fff' },
    hsc:         { name: 'HSC প্রস্তুতি',    emoji: '📘', color: '#10b981' },
    ssc:         { name: 'SSC প্রস্তুতি',    emoji: '📗', color: '#f59e0b' },
    medical:     { name: 'মেডিকেল এডমিশন', emoji: '⚕️', color: '#ef4444' },
    engineering: { name: 'ইঞ্জিনিয়ারিং',   emoji: '⚙️', color: '#8b5cf6' },
    bank:        { name: 'ব্যাংক জব',       emoji: '🏦', color: '#ec4899' },
    university:  { name: 'ভার্সিটি ক ইউনিট', emoji: '🎓', color: '#06b6d4' },
    primary:     { name: 'প্রাইমারি শিক্ষক', emoji: '✏️', color: '#84cc16' },
    other:       { name: 'সাধারণ জ্ঞান',    emoji: '📋', color: '#64748b' },
};

export default function PracticeIndex({ goals = [], counts = {}, todayCount = 0, dailyLimit = 5, stream = null }) {
    const { errors } = usePage().props;
    const [selectedGoal, setSelectedGoal] = useState(goals[0] || 'bcs');
    const [qCount, setQCount]             = useState(10);
    const [loading, setLoading]           = useState(false);

    const remaining = Math.max(0, dailyLimit - todayCount);

    const handleStart = (e) => {
        e.preventDefault();
        setLoading(true);
        router.post(route('practice.start'), {
            goal: selectedGoal,
            count: qCount,
        }, {
            onError: () => setLoading(false),
            onFinish: () => setLoading(false),
        });
    };

    return (
        <MobileLayout title="প্র্যাকটিস মোড">
            <Head title="প্র্যাকটিস মোড — ExamArena" />

            <div style={{ padding: '16px', maxWidth: 520, margin: '0 auto' }}>

                {/* Header Card */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(5,150,105,0.08))',
                    border: '1px solid rgba(16,185,129,0.25)', borderRadius: 20, padding: '20px',
                    marginBottom: 20, textAlign: 'center',
                }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: '50%', margin: '0 auto 10px',
                        background: 'linear-gradient(135deg,#10b981,#059669)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
                    }}>
                        <BookOpen size={24} color="white" />
                    </div>
                    <h2 style={{ color: 'white', fontWeight: 800, fontSize: 20, margin: 0 }}>
                        আনলিমিটেড প্র্যাকটিস
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 }}>
                        ক্যাটাগরি বেছে নাও, সঠিক উত্তর দেখো এবং AI শিক্ষক থেকে ব্যাখ্যা বুঝে নাও
                    </p>

                    {/* Unlimited Token Badge */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        marginTop: 14, padding: '6px 14px', borderRadius: 20,
                        background: 'rgba(16,185,129,0.15)',
                        border: '1px solid rgba(16,185,129,0.3)',
                    }}>
                        <Sparkles size={13} color="#34d399" />
                        <span style={{ color: '#34d399', fontSize: 12, fontWeight: 700 }}>
                            ⚡ টোকেন দিয়ে আনলিমিটেড প্র্যাকটিস
                        </span>
                    </div>
                </div>

                {errors.limit && (
                    <div style={{
                        padding: '12px 14px', borderRadius: 12, marginBottom: 16,
                        background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                        color: '#f87171', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                        <AlertCircle size={16} />
                        {errors.limit}
                    </div>
                )}

                <form onSubmit={handleStart}>
                    {/* Goal Selection */}
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
                            পরীক্ষা নির্বাচন করো
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                            {Object.entries(GOAL_DETAILS).map(([id, info]) => {
                                const isSelected = selectedGoal === id;
                                const qTotal = counts[id] || 0;
                                return (
                                    <motion.button
                                        key={id}
                                        type="button"
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => setSelectedGoal(id)}
                                        style={{
                                            padding: '14px 12px', borderRadius: 16, cursor: 'pointer',
                                            textAlign: 'left', border: '1px solid',
                                            background: isSelected ? `${info.color}22` : 'rgba(255,255,255,0.03)',
                                            borderColor: isSelected ? info.color : 'rgba(255,255,255,0.08)',
                                            boxShadow: isSelected ? `0 4px 16px ${info.color}25` : 'none',
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        <div style={{ fontSize: 24, marginBottom: 6 }}>{info.emoji}</div>
                                        <div style={{ color: isSelected ? 'white' : 'rgba(255,255,255,0.8)', fontWeight: 700, fontSize: 14 }}>
                                            {info.name}
                                        </div>
                                        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 }}>
                                            {qTotal} টি প্রশ্ন
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Question Count Selection */}
                    <div style={{ marginBottom: 24 }}>
                        <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
                            প্রশ্ন সংখ্যা
                        </label>
                        <div style={{ display: 'flex', gap: 10 }}>
                            {[5, 10, 15, 20].map(cnt => (
                                <button
                                    key={cnt}
                                    type="button"
                                    onClick={() => setQCount(cnt)}
                                    style={{
                                        flex: 1, padding: '10px', borderRadius: 12, fontSize: 13, fontWeight: 700,
                                        border: '1px solid', cursor: 'pointer',
                                        background: qCount === cnt ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.04)',
                                        borderColor: qCount === cnt ? '#10b981' : 'rgba(255,255,255,0.1)',
                                        color: qCount === cnt ? '#34d399' : 'rgba(255,255,255,0.6)',
                                    }}
                                >
                                    {cnt} টি
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%', padding: '16px', borderRadius: 16, border: 'none',
                            background: 'linear-gradient(135deg,#10b981,#059669)',
                            color: 'white',
                            fontWeight: 800, fontSize: 16, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            boxShadow: '0 6px 20px rgba(16,185,129,0.35)',
                        }}
                    >
                        <PlayCircle size={20} />
                        {loading ? 'প্রশ্ন প্রস্তুত হচ্ছে...' : '⚡২ টোকেন দিয়ে প্র্যাকটিস শুরু করো'}
                    </motion.button>
                </form>

            </div>
        </MobileLayout>
    );
}
