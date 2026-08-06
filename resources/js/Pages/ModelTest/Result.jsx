import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Trophy, CheckCircle2, XCircle, Clock, ArrowLeft, RotateCcw, AlertTriangle } from 'lucide-react';
import MobileLayout from '@/Layouts/MobileLayout';

export default function ModelTestResult({ test }) {
    const questions = test.questions_snapshot || [];
    const answers   = test.answers || {};

    const totalQuestions = questions.length;
    const score          = parseFloat(test.score || 0);
    const percentage     = Math.round((score / totalQuestions) * 100);

    let correctCount = 0;
    let wrongCount   = 0;
    let skippedCount = 0;

    questions.forEach(q => {
        const userAns = answers[q.id];
        if (!userAns) {
            skippedCount++;
        } else if (userAns.toLowerCase() === q.correct_answer.toLowerCase()) {
            correctCount++;
        } else {
            wrongCount++;
        }
    });

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m} মিনিট ${s} সেকেন্ড`;
    };

    return (
        <MobileLayout title="পরীক্ষার ফলাফল">
            <Head title="ফলাফল রিভিউ — ExamArena" />

            <div style={{ padding: '16px', maxWidth: 520, margin: '0 auto', paddingBottom: 80 }}>

                {/* Score Summary Card */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(77,111,255,0.2), rgba(124,58,237,0.15))',
                    border: '1px solid rgba(77,111,255,0.3)', borderRadius: 24, padding: '24px 20px',
                    textAlign: 'center', marginBottom: 20, boxShadow: '0 10px 30px rgba(77,111,255,0.15)'
                }}>
                    <div style={{ fontSize: 56, marginBottom: 8 }}>
                        {percentage >= 80 ? '🎉' : percentage >= 50 ? '👏' : '💪'}
                    </div>

                    <h2 style={{ color: 'white', fontWeight: 900, fontSize: 22, margin: 0 }}>
                        {test.title}
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 4 }}>
                        সময় লেগেছে: {formatTime(test.time_taken_sec || 0)}
                    </p>

                    {/* Score Circle */}
                    <div style={{
                        width: 130, height: 130, borderRadius: '50%', margin: '20px auto',
                        background: 'rgba(0,0,0,0.3)', border: '2px solid rgba(77,111,255,0.5)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <span style={{ color: '#93b4ff', fontSize: 34, fontWeight: 900, lineHeight: 1 }}>
                            {score}
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>
                            মোট: {test.total_marks}
                        </span>
                    </div>

                    {/* Breakdown */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16 }}>
                        <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', padding: '10px 4px', borderRadius: 14 }}>
                            <div style={{ color: '#34d399', fontWeight: 900, fontSize: 18 }}>{correctCount}</div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 2 }}>সঠিক</div>
                        </div>
                        <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', padding: '10px 4px', borderRadius: 14 }}>
                            <div style={{ color: '#f87171', fontWeight: 900, fontSize: 18 }}>{wrongCount}</div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 2 }}>ভুল</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 4px', borderRadius: 14 }}>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 900, fontSize: 18 }}>{skippedCount}</div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 2 }}>উত্তর দেননি</div>
                        </div>
                    </div>
                </div>

                {/* Return button */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                    <Link
                        href={route('model-test.index')}
                        style={{
                            flex: 1, padding: '14px', borderRadius: 14, textDecoration: 'none',
                            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                            color: 'white', fontWeight: 700, fontSize: 14, textAlign: 'center',
                        }}
                    >
                        ← মডেল টেস্ট তালিকা
                    </Link>
                </div>

                {/* Detailed Answer Review */}
                <div style={{ color: 'white', fontWeight: 800, fontSize: 16, marginBottom: 14 }}>
                    📋 উত্তরপত্র ও ব্যাখ্যা রিভিউ
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {questions.map((q, idx) => {
                        const userAns    = answers[q.id];
                        const isCorrect  = userAns && userAns.toLowerCase() === q.correct_answer.toLowerCase();
                        const isSkipped  = !userAns;

                        return (
                            <div
                                key={q.id}
                                style={{
                                    padding: '16px', borderRadius: 18,
                                    background: 'rgba(255,255,255,0.03)',
                                    border: isCorrect
                                        ? '1px solid rgba(16,185,129,0.3)'
                                        : (isSkipped ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(239,68,68,0.3)'),
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700 }}>
                                        প্রশ্ন {idx + 1}
                                    </span>
                                    <span style={{
                                        padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800,
                                        background: isCorrect ? 'rgba(16,185,129,0.15)' : (isSkipped ? 'rgba(255,255,255,0.06)' : 'rgba(239,68,68,0.15)'),
                                        color: isCorrect ? '#34d399' : (isSkipped ? 'rgba(255,255,255,0.4)' : '#f87171'),
                                    }}>
                                        {isCorrect ? 'সঠিক ✓' : (isSkipped ? 'এড়িয়ে গেছেন' : 'ভুল ✗')}
                                    </span>
                                </div>

                                <div style={{ color: 'white', fontWeight: 700, fontSize: 14, lineHeight: 1.5, marginBottom: 12 }}>
                                    {q.question_text}
                                </div>

                                {/* Options Review */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                                    {Object.entries(q.options || {}).map(([key, val]) => {
                                        const isSelectedOpt = userAns === key;
                                        const isCorrectOpt  = key.toLowerCase() === q.correct_answer.toLowerCase();

                                        let bg = 'transparent';
                                        let border = '1px solid transparent';
                                        let color = 'rgba(255,255,255,0.5)';

                                        if (isCorrectOpt) {
                                            bg = 'rgba(16,185,129,0.12)';
                                            border = '1px solid rgba(16,185,129,0.4)';
                                            color = '#34d399';
                                        } else if (isSelectedOpt && !isCorrectOpt) {
                                            bg = 'rgba(239,68,68,0.12)';
                                            border = '1px solid rgba(239,68,68,0.4)';
                                            color = '#f87171';
                                        }

                                        return (
                                            <div
                                                key={key}
                                                style={{
                                                    padding: '8px 12px', borderRadius: 10,
                                                    background: bg, border: border, color: color,
                                                    fontSize: 13, fontWeight: (isCorrectOpt || isSelectedOpt) ? 700 : 400,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                }}
                                            >
                                                <span>{key.toUpperCase()}. {val}</span>
                                                {isCorrectOpt && <CheckCircle2 size={14} color="#34d399" />}
                                                {isSelectedOpt && !isCorrectOpt && <XCircle size={14} color="#f87171" />}
                                            </div>
                                        );
                                    })}
                                </div>

                                {q.explanation && (
                                    <div style={{
                                        padding: '10px 12px', borderRadius: 10,
                                        background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
                                        color: 'rgba(255,255,255,0.75)', fontSize: 12, lineHeight: 1.5,
                                    }}>
                                        💡 <strong style={{ color: '#c084fc' }}>ব্যাখ্যা:</strong> {q.explanation}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

            </div>
        </MobileLayout>
    );
}
