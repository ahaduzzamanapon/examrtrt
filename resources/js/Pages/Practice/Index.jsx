import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, AlertCircle, PlayCircle } from 'lucide-react';
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

export default function PracticeIndex({ goals = [], counts = {}, todayCount = 0, dailyLimit = 5 }) {
    const { errors, auth } = usePage().props;
    const [qCount, setQCount]   = useState(10);
    const [loading, setLoading] = useState(false);

    // Auto-pick the user's first exam_goal (or fallback to 'bcs')
    const userGoal = Array.isArray(auth?.user?.exam_goal)
        ? (auth.user.exam_goal[0] || 'bcs')
        : (auth?.user?.exam_goal || goals[0] || 'bcs');

    const goalInfo = GOAL_DETAILS[userGoal] || GOAL_DETAILS['bcs'];

    const handleStart = (e) => {
        e.preventDefault();
        setLoading(true);
        router.post(route('practice.start'), {
            goal: userGoal,
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

                    {/* Current goal badge */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        marginTop: 12, padding: '8px 16px', borderRadius: 20,
                        background: `${goalInfo.color}22`,
                        border: `1px solid ${goalInfo.color}55`,
                    }}>
                        <span style={{ fontSize: 18 }}>{goalInfo.emoji}</span>
                        <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>
                            {goalInfo.name}
                        </span>
                    </div>

                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 8 }}>
                        তোমার নির্বাচিত পরীক্ষার প্রশ্ন দিয়ে প্র্যাকটিস হবে
                    </p>

                    {/* Unlimited Token Badge */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        marginTop: 10, padding: '6px 14px', borderRadius: 20,
                        background: 'rgba(16,185,129,0.15)',
                        border: '1px solid rgba(16,185,129,0.3)',
                    }}>
                        <Sparkles size={13} color="#34d399" />
                        <span style={{ color: '#34d399', fontSize: 12, fontWeight: 700 }}>
                            ⚡ টোকেন দিয়ে আনলিমিটেড প্র্যাকটিস
                        </span>
                    </div>
                </div>

                {errors.limit && (
                    <div style={{
                        padding: '14px 16px', borderRadius: 14, marginBottom: 16,
                        background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                        color: '#f87171', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 10,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <AlertCircle size={18} />
                            <span>{errors.limit}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => router.visit(route('tokens.index'))}
                            style={{
                                padding: '8px 14px', borderRadius: 10, border: 'none',
                                background: 'linear-gradient(135deg,#10b981,#059669)',
                                color: 'white', fontWeight: 800, fontSize: 12, cursor: 'pointer',
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                alignSelf: 'flex-start', boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                            }}
                        >
                            ⚡ টোকেন আয় করুন (Token Store) →
                        </button>
                    </div>
                )}

                <form onSubmit={handleStart}>
                    {/* Question Count Selection */}
                    <div style={{ marginBottom: 24 }}>
                        <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
                            কতটি প্রশ্ন দিয়ে প্র্যাকটিস করবে?
                        </label>
                        <div style={{ display: 'flex', gap: 10 }}>
                            {[5, 10, 15, 20].map(cnt => (
                                <button
                                    key={cnt}
                                    type="button"
                                    onClick={() => setQCount(cnt)}
                                    style={{
                                        flex: 1, padding: '14px', borderRadius: 12, fontSize: 14, fontWeight: 700,
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
                        {loading ? 'প্রশ্ন প্রস্তুত হচ্ছে...' : '⚡ ২ টোকেন দিয়ে প্র্যাকটিস শুরু করো'}
                    </motion.button>
                </form>

            </div>
        </MobileLayout>
    );
}
