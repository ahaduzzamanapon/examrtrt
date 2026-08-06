import { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, AlertTriangle, Send, ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import MobileLayout from '@/Layouts/MobileLayout';
import ReportQuestionModal from '@/Components/ReportQuestionModal';

export default function ModelTestRoom({ test }) {
    const questions = test.questions_snapshot || [];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers]         = useState({}); // { [question_id]: selected_key }
    const [timeLeft, setTimeLeft]       = useState(test.duration_minutes * 60);
    const [submitting, setSubmitting]   = useState(false);
    const [reportOpen, setReportOpen]   = useState(false);

    const timerRef = useRef(null);
    const startTimeRef = useRef(Date.now());
    const currentQ = questions[currentIndex];

    // Countdown Timer
    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    submitExam();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, []);

    const handleSelectOption = (qId, optionKey) => {
        setAnswers(prev => ({ ...prev, [qId]: optionKey }));
    };

    const submitExam = () => {
        if (submitting) return;
        setSubmitting(true);

        const timeTakenSec = Math.round((Date.now() - startTimeRef.current) / 1000);

        router.post(route('model-test.submit', test.id), {
            answers: answers,
            time_taken_sec: timeTakenSec,
        });
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const answeredCount = Object.keys(answers).length;

    return (
        <MobileLayout title={test.title}>
            <Head title={`${test.title} — ExamArena`} />

            <div style={{ padding: '16px', maxWidth: 520, margin: '0 auto', paddingBottom: 100 }}>

                {/* Top Sticky Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: 16, marginBottom: 18,
                    background: 'rgba(15,20,50,0.85)', backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(77,111,255,0.25)', sticky: 'top', top: 10, zIndex: 40,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#93b4ff', fontWeight: 800, fontSize: 14 }}>
                        <Clock size={16} />
                        <span style={{ color: timeLeft < 120 ? '#f87171' : 'white' }}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>

                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700 }}>
                        উত্তর: <span style={{ color: '#34d399' }}>{answeredCount}</span>/{questions.length}
                    </div>

                    <button
                        onClick={() => {
                            if (confirm('পরীক্ষা জমা দিতে চান?')) submitExam();
                        }}
                        disabled={submitting}
                        style={{
                            padding: '8px 14px', borderRadius: 10, border: 'none',
                            background: 'linear-gradient(135deg,#10b981,#059669)',
                            color: 'white', fontWeight: 800, fontSize: 12, cursor: 'pointer',
                        }}
                    >
                        {submitting ? 'জমা হচ্ছে...' : 'জমা দাও ✓'}
                    </button>
                </div>

                {/* Question Palette Scrollable */}
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 16, scrollbarWidth: 'none' }}>
                    {questions.map((q, idx) => {
                        const isAnswered = !!answers[q.id];
                        const isCurrent  = idx === currentIndex;
                        return (
                            <button
                                key={q.id}
                                onClick={() => setCurrentIndex(idx)}
                                style={{
                                    width: 32, height: 32, borderRadius: 8, flexShrink: 0, border: 'none',
                                    background: isCurrent ? '#4d6fff' : (isAnswered ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.06)'),
                                    color: isCurrent ? 'white' : (isAnswered ? '#34d399' : 'rgba(255,255,255,0.4)'),
                                    fontWeight: 800, fontSize: 11, cursor: 'pointer',
                                    border: isCurrent ? '1px solid #93b4ff' : (isAnswered ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.1)'),
                                }}
                            >
                                {idx + 1}
                            </button>
                        );
                    })}
                </div>

                {/* Question Box */}
                {currentQ && (
                    <motion.div key={currentQ.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                        <div style={{
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                            borderRadius: 20, padding: '20px', marginBottom: 18,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700 }}>
                                    প্রশ্ন {currentIndex + 1} / {questions.length}
                                </span>
                                {currentQ.subject && (
                                    <span style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(77,111,255,0.15)', color: '#93b4ff', fontSize: 10, fontWeight: 700 }}>
                                        {currentQ.subject}
                                    </span>
                                )}
                            </div>

                            <h3 style={{ color: 'white', fontWeight: 700, fontSize: 16, lineHeight: 1.5, margin: 0 }}>
                                {currentQ.question_text}
                            </h3>
                        </div>

                        {/* Options */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                            {Object.entries(currentQ.options || {}).map(([key, val]) => {
                                const isSelected = answers[currentQ.id] === key;
                                return (
                                    <motion.button
                                        key={key}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSelectOption(currentQ.id, key)}
                                        style={{
                                            padding: '14px 16px', borderRadius: 14,
                                            display: 'flex', alignItems: 'center', gap: 12,
                                            background: isSelected ? 'rgba(77,111,255,0.2)' : 'rgba(255,255,255,0.03)',
                                            border: `1px solid ${isSelected ? '#4d6fff' : 'rgba(255,255,255,0.1)'}`,
                                            color: isSelected ? '#93b4ff' : 'rgba(255,255,255,0.85)',
                                            cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                                        }}
                                    >
                                        <div style={{
                                            width: 28, height: 28, borderRadius: 8,
                                            background: isSelected ? '#4d6fff' : 'rgba(255,255,255,0.08)',
                                            color: isSelected ? 'white' : 'rgba(255,255,255,0.6)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 800, fontSize: 13, flexShrink: 0,
                                        }}>
                                            {key.toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>
                                            {val}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Navigation controls */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                            <button
                                onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                                disabled={currentIndex === 0}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: 12,
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                    color: currentIndex === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
                                    fontWeight: 700, fontSize: 13, cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                                }}
                            >
                                <ChevronLeft size={16} /> আগের প্রশ্ন
                            </button>

                            <button
                                onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
                                disabled={currentIndex === questions.length - 1}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: 12,
                                    background: 'linear-gradient(135deg,#4d6fff,#7c3aed)', border: 'none',
                                    color: 'white', fontWeight: 700, fontSize: 13, cursor: currentIndex === questions.length - 1 ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                                }}
                            >
                                পরের প্রশ্ন <ChevronRight size={16} />
                            </button>
                        </div>
                        {/* Report Button */}
                        <button
                            onClick={() => setReportOpen(true)}
                            style={{
                                width: '100%', marginTop: 12, padding: '10px 14px', borderRadius: 12,
                                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                                color: '#f87171', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            }}
                        >
                            <Flag size={15} /> প্রশ্নে কোনো ভুল আছে? রিপোর্ট করুন 🚩
                        </button>
                    </motion.div>
                )}

            </div>

            {/* Question Report Modal */}
            <ReportQuestionModal
                questionId={currentQ?.id}
                questionText={currentQ?.question_text}
                isOpen={reportOpen}
                onClose={() => setReportOpen(false)}
            />
        </MobileLayout>
    );
}
