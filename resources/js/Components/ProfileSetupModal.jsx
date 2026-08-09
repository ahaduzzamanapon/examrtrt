/**
 * ProfileSetupModal
 * Shows when user has no exam_goal or (hsc/ssc without stream).
 * Lets them pick their goal + stream and saves via profile.setup route.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const GOALS = [
    { id: 'bcs',         emoji: '🏛️', label: 'BCS' },
    { id: 'hsc',         emoji: '📘', label: 'HSC' },
    { id: 'ssc',         emoji: '📗', label: 'SSC' },
    { id: 'medical',     emoji: '⚕️', label: 'মেডিকেল' },
    { id: 'engineering', emoji: '⚙️', label: 'ইঞ্জিনিয়ারিং' },
    { id: 'bank',        emoji: '🏦', label: 'ব্যাংক জব' },
    { id: 'university',  emoji: '🎓', label: 'ভার্সিটি' },
    { id: 'primary',     emoji: '✏️', label: 'প্রাইমারি' },
    { id: 'ntrca',       emoji: '📜', label: 'NTRCA' },
    { id: 'other',       emoji: '📋', label: 'অন্যান্য' },
];

const STREAMS = [
    { id: 'science',  emoji: '🔬', label: 'বিজ্ঞান' },
    { id: 'arts',     emoji: '📜', label: 'মানবিক' },
    { id: 'commerce', emoji: '💼', label: 'বাণিজ্য' },
];

export default function ProfileSetupModal({ onDone }) {
    const [step,      setStep]      = useState(1); // 1=goal, 2=stream (if needed), 3=done
    const [selGoal,   setSelGoal]   = useState(null);
    const [selStream, setSelStream] = useState(null);
    const [saving,    setSaving]    = useState(false);

    const needsStream = selGoal === 'hsc' || selGoal === 'ssc';

    const handleGoalNext = () => {
        if (!selGoal) return;
        if (needsStream) {
            setStep(2);
        } else {
            save(selGoal, null);
        }
    };

    const save = async (goal, stream) => {
        setSaving(true);
        try {
            await axios.post(route('profile.setup'), { exam_goal: goal, stream });
            setStep(3);
            setTimeout(() => onDone?.(), 1200);
        } catch {
            setSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '24px 16px',
                }}
            >
                <motion.div
                    initial={{ scale: 0.88, opacity: 0, y: 24 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                    style={{
                        width: '100%', maxWidth: 440,
                        background: 'linear-gradient(135deg,rgba(10,14,40,0.98),rgba(15,20,50,0.98))',
                        border: '1px solid rgba(77,111,255,0.25)',
                        borderRadius: 24, padding: 28,
                        boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
                    }}
                >
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: '50%', margin: '0 auto 12px',
                            background: 'linear-gradient(135deg,#4d6fff,#7c3aed)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <GraduationCap size={26} color="white" />
                        </div>
                        <h2 style={{ color: 'white', fontWeight: 800, fontSize: 20, margin: 0 }}>
                            {step === 1 && 'তোমার লক্ষ্য কী?'}
                            {step === 2 && 'তোমার বিভাগ কোনটি?'}
                            {step === 3 && 'সেটআপ সম্পন্ন! 🎉'}
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 6 }}>
                            {step === 1 && 'তোমার জন্য সঠিক প্রশ্ন ও পরীক্ষা দেখাতে এটি দরকার'}
                            {step === 2 && `${GOALS.find(g => g.id === selGoal)?.label} — তোমার বিভাগ সিলেক্ট করো`}
                            {step === 3 && 'তোমার ড্যাশবোর্ড এখন কাস্টমাইজড হয়ে গেছে!'}
                        </p>
                    </div>

                    {/* Step 1: Goal */}
                    {step === 1 && (
                        <>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                                {GOALS.map(g => (
                                    <motion.button
                                        key={g.id}
                                        whileTap={{ scale: 0.92 }}
                                        onClick={() => setSelGoal(g.id)}
                                        style={{
                                            flex: '1 1 calc(33% - 8px)', minWidth: 100,
                                            padding: '10px 8px', borderRadius: 14, cursor: 'pointer',
                                            fontSize: 13, fontWeight: 600,
                                            border: '1px solid',
                                            background: selGoal === g.id
                                                ? 'rgba(77,111,255,0.2)' : 'rgba(255,255,255,0.04)',
                                            borderColor: selGoal === g.id
                                                ? 'rgba(77,111,255,0.5)' : 'rgba(255,255,255,0.1)',
                                            color: selGoal === g.id ? '#93b4ff' : 'rgba(255,255,255,0.55)',
                                            textAlign: 'center', transition: 'all 0.15s',
                                        }}
                                    >
                                        <div style={{ fontSize: 20, marginBottom: 4 }}>{g.emoji}</div>
                                        {g.label}
                                    </motion.button>
                                ))}
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.96 }}
                                onClick={handleGoalNext}
                                disabled={!selGoal || saving}
                                style={{
                                    width: '100%', padding: '13px', borderRadius: 14, border: 'none',
                                    background: selGoal
                                        ? 'linear-gradient(135deg,#4d6fff,#7c3aed)'
                                        : 'rgba(255,255,255,0.08)',
                                    color: selGoal ? 'white' : 'rgba(255,255,255,0.3)',
                                    fontWeight: 700, fontSize: 15, cursor: selGoal ? 'pointer' : 'not-allowed',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                }}
                            >
                                {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                                {needsStream ? 'পরবর্তী →' : 'সেভ করো ✓'}
                            </motion.button>
                        </>
                    )}

                    {/* Step 2: Stream */}
                    {step === 2 && (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                                {STREAMS.map(s => (
                                    <motion.button
                                        key={s.id}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setSelStream(s.id)}
                                        style={{
                                            padding: '14px 18px', borderRadius: 14, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: 14,
                                            border: '1px solid',
                                            background: selStream === s.id
                                                ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                                            borderColor: selStream === s.id
                                                ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.1)',
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        <span style={{ fontSize: 24 }}>{s.emoji}</span>
                                        <span style={{
                                            color: selStream === s.id ? '#34d399' : 'rgba(255,255,255,0.7)',
                                            fontWeight: 700, fontSize: 15,
                                        }}>{s.label}</span>
                                        {selStream === s.id && (
                                            <CheckCircle size={16} style={{ color: '#34d399', marginLeft: 'auto' }} />
                                        )}
                                    </motion.button>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: 10 }}>
                                <button
                                    onClick={() => setStep(1)}
                                    style={{
                                        flex: 1, padding: '12px', borderRadius: 14,
                                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                                    }}
                                >
                                    ← পেছনে
                                </button>
                                <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => save(selGoal, selStream)}
                                    disabled={!selStream || saving}
                                    style={{
                                        flex: 2, padding: '12px', borderRadius: 14, border: 'none',
                                        background: selStream
                                            ? 'linear-gradient(135deg,#10b981,#059669)'
                                            : 'rgba(255,255,255,0.08)',
                                        color: selStream ? 'white' : 'rgba(255,255,255,0.3)',
                                        fontWeight: 700, fontSize: 14, cursor: selStream ? 'pointer' : 'not-allowed',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    }}
                                >
                                    {saving
                                        ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                        : <CheckCircle size={14} />
                                    }
                                    সেভ করো
                                </motion.button>
                            </div>
                        </>
                    )}

                    {/* Step 3: Done */}
                    {step === 3 && (
                        <div style={{ textAlign: 'center', padding: '12px 0' }}>
                            <motion.div
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                                style={{ fontSize: 56 }}
                            >🎯</motion.div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
