import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2, XCircle, Bot, ArrowRight, RefreshCw,
    Trophy, ChevronRight, HelpCircle, Sparkles, Send, Flag,
} from 'lucide-react';
import axios from 'axios';
import MobileLayout from '@/Layouts/MobileLayout';
import ReportQuestionModal from '@/Components/ReportQuestionModal';

export default function PracticeSession({ questions = [], goal = '' }) {
    const [index, setIndex]             = useState(0);
    const [selectedOpt, setSelectedOpt] = useState(null);
    const [answers, setAnswers]         = useState({}); // { [idx]: { selected, isCorrect } }
    const [score, setScore]             = useState(0);
    const [isFinished, setIsFinished]   = useState(false);

    // AI Modal state
    const [aiOpen, setAiOpen]           = useState(false);
    const [aiQuery, setAiQuery]         = useState('');
    const [aiAnswer, setAiAnswer]       = useState('');
    const [aiLoading, setAiLoading]     = useState(false);

    // Report Modal state
    const [reportOpen, setReportOpen]   = useState(false);

    const currentQ = questions[index];

    const handleAnswer = (key) => {
        if (selectedOpt) return; // already answered this question

        const correct = key.toLowerCase() === currentQ.correct_answer.toLowerCase();
        setSelectedOpt(key);
        setAnswers(prev => ({ ...prev, [index]: { selected: key, isCorrect: correct } }));

        if (correct) {
            setScore(s => s + 1);
        }
    };

    const handleNext = () => {
        if (index < questions.length - 1) {
            setIndex(i => i + 1);
            setSelectedOpt(answers[index + 1]?.selected || null);
        } else {
            setIsFinished(true);
        }
    };

    const askAiTeacher = async () => {
        if (!aiQuery.trim()) return;
        setAiLoading(true);
        setAiAnswer('');
        try {
            const context = `প্রশ্ন: ${currentQ.question_text}\nসঠিক উত্তর: ${currentQ.options[currentQ.correct_answer.toUpperCase()] || currentQ.correct_answer}\nব্যাখ্যা: ${currentQ.explanation || 'নাই'}`;
            const res = await axios.post(route('practice.ask-ai'), {
                question: aiQuery,
                context: context,
            });
            setAiAnswer(res.data.answer);
        } catch (err) {
            setAiAnswer(err.response?.data?.error || 'AI সংযোগে কোনো সমস্যা হয়েছে।');
        }
        setAiLoading(false);
    };

    const openAiForCurrent = () => {
        setAiQuery('এই প্রশ্নটির উত্তর কেন এটি হলো আরেকটু ব্যাখ্যা করে বুঝিয়ে দাও।');
        setAiAnswer('');
        setAiOpen(true);
    };

    if (isFinished) {
        const pct = Math.round((score / questions.length) * 100);
        return (
            <MobileLayout title="প্র্যাকটিস ফলাফল">
                <Head title="প্র্যাকটিস ফলাফল — ExamArena" />
                <div style={{ padding: '24px 16px', maxWidth: 440, margin: '0 auto', textAlign: 'center' }}>
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
                        <div style={{ fontSize: 64, marginBottom: 10 }}>
                            {pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}
                        </div>
                        <h2 style={{ color: 'white', fontWeight: 900, fontSize: 24, margin: 0 }}>
                            প্র্যাকটিস সম্পন্ন!
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 4 }}>
                            {questions.length} টি প্রশ্নের মধ্যে আপনার ফলাফল
                        </p>

                        {/* Score Circle */}
                        <div style={{
                            width: 140, height: 140, borderRadius: '50%', margin: '24px auto',
                            background: 'linear-gradient(135deg,rgba(77,111,255,0.2),rgba(124,58,237,0.15))',
                            border: '2px solid rgba(77,111,255,0.4)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 10px 30px rgba(77,111,255,0.2)',
                        }}>
                            <span style={{ color: '#93b4ff', fontSize: 36, fontWeight: 900, lineHeight: 1 }}>{score}/{questions.length}</span>
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>সঠিক</span>
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                            <Link href={route('practice.index')}
                                style={{
                                    flex: 1, padding: '14px', borderRadius: 14, textDecoration: 'none',
                                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white', fontWeight: 700, fontSize: 14, display: 'block',
                                }}
                            >
                                ← ক্যাটাগরি তালিকা
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </MobileLayout>
        );
    }

    return (
        <MobileLayout title="প্র্যাকটিস সেশন">
            <Head title="প্র্যাকটিস — ExamArena" />

            <div style={{ padding: '16px', maxWidth: 520, margin: '0 auto', paddingBottom: 100 }}>

                {/* Progress Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700 }}>
                        প্রশ্ন {index + 1} / {questions.length}
                    </span>
                    <span style={{ color: '#34d399', fontSize: 12, fontWeight: 700 }}>
                        স্কোর: {score}
                    </span>
                </div>
                <div style={{ height: 6, width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden', marginBottom: 20 }}>
                    <div style={{
                        height: '100%', width: `${((index + 1) / questions.length) * 100}%`,
                        background: 'linear-gradient(90deg,#10b981,#34d399)', transition: 'width 0.3s',
                    }} />
                </div>

                {/* Question Box */}
                {currentQ && (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQ.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Subject tag */}
                            {currentQ.subject && (
                                <span style={{
                                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                                    background: 'rgba(77,111,255,0.15)', color: '#93b4ff', border: '1px solid rgba(77,111,255,0.3)',
                                    display: 'inline-block', marginBottom: 12,
                                }}>
                                    {currentQ.subject}
                                </span>
                            )}

                            <h2 style={{ color: 'white', fontWeight: 700, fontSize: 16, lineHeight: 1.6, marginBottom: 20 }}>
                                {currentQ.question_text}
                            </h2>

                            {/* Options */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                                {Object.entries(currentQ.options || {}).map(([key, val]) => {
                                    const isSelected   = selectedOpt === key;
                                    const isCorrectOpt = key.toLowerCase() === currentQ.correct_answer.toLowerCase();
                                    const hasAnswered  = !!selectedOpt;

                                    let border = '1px solid rgba(255,255,255,0.1)';
                                    let bg = 'rgba(255,255,255,0.04)';
                                    let color = 'rgba(255,255,255,0.85)';

                                    if (hasAnswered) {
                                        if (isCorrectOpt) {
                                            border = '1px solid rgba(52,211,153,0.5)';
                                            bg = 'rgba(52,211,153,0.15)';
                                            color = '#34d399';
                                        } else if (isSelected && !isCorrectOpt) {
                                            border = '1px solid rgba(239,68,68,0.5)';
                                            bg = 'rgba(239,68,68,0.15)';
                                            color = '#f87171';
                                        } else {
                                            color = 'rgba(255,255,255,0.3)';
                                        }
                                    }

                                    return (
                                        <motion.button
                                            key={key}
                                            whileTap={!hasAnswered ? { scale: 0.98 } : {}}
                                            onClick={() => handleAnswer(key)}
                                            disabled={hasAnswered}
                                            style={{
                                                padding: '14px 16px', borderRadius: 14,
                                                display: 'flex', alignItems: 'center', gap: 12,
                                                background: bg, border: border, color: color,
                                                cursor: hasAnswered ? 'default' : 'pointer',
                                                textAlign: 'left', transition: 'all 0.15s',
                                            }}
                                        >
                                            <div style={{
                                                width: 28, height: 28, borderRadius: 8,
                                                background: hasAnswered && isCorrectOpt ? '#34d399' : (hasAnswered && isSelected ? '#ef4444' : 'rgba(255,255,255,0.08)'),
                                                color: hasAnswered && (isCorrectOpt || isSelected) ? 'white' : 'rgba(255,255,255,0.6)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 800, fontSize: 13, flexShrink: 0,
                                            }}>
                                                {key.toUpperCase()}
                                            </div>
                                            <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>
                                                {val}
                                            </div>
                                            {hasAnswered && isCorrectOpt && <CheckCircle2 size={18} color="#34d399" />}
                                            {hasAnswered && isSelected && !isCorrectOpt && <XCircle size={18} color="#f87171" />}
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* Explanation & Ask AI Section (When answered) */}
                            {selectedOpt && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>

                                    {/* Explanation card */}
                                    <div style={{
                                        padding: '14px 16px', borderRadius: 14,
                                        background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)',
                                        color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 1.6, marginBottom: 12,
                                    }}>
                                        <div style={{ color: '#c084fc', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <HelpCircle size={15} /> ব্যাখ্যা:
                                        </div>
                                        {currentQ.explanation || 'ব্যাখ্যা দেওয়া নেই।'}
                                    </div>

                                    {/* Ask AI Button */}
                                    <button
                                        onClick={openAiForCurrent}
                                        style={{
                                            width: '100%', padding: '12px 16px', borderRadius: 14,
                                            background: 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(77,111,255,0.15))',
                                            border: '1px solid rgba(124,58,237,0.4)',
                                            color: '#c084fc', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                            marginBottom: 8,
                                        }}
                                    >
                                        <Bot size={18} /> Ask AI Teacher — ⚡৫ টোকেন দিয়ে শোনো
                                    </button>

                                    {/* Report Question Button */}
                                    <button
                                        onClick={() => setReportOpen(true)}
                                        style={{
                                            width: '100%', padding: '10px 14px', borderRadius: 12,
                                            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                                            color: '#f87171', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                        }}
                                    >
                                        <Flag size={15} /> প্রশ্নে কোনো ভুল আছে? রিপোর্ট করুন 🚩
                                    </button>
                                </motion.div>
                            )}

                            {/* Next Button */}
                            {selectedOpt && (
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleNext}
                                    style={{
                                        width: '100%', padding: '16px', borderRadius: 16, border: 'none',
                                        background: 'linear-gradient(135deg,#4d6fff,#7c3aed)',
                                        color: 'white', fontWeight: 800, fontSize: 15, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        boxShadow: '0 6px 20px rgba(77,111,255,0.3)',
                                    }}
                                >
                                    {index < questions.length - 1 ? 'পরবর্তী প্রশ্ন →' : 'ফলাফল দেখো 🎉'}
                                </motion.button>
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}

            </div>

            {/* AI Modal */}
            <AnimatePresence>
                {aiOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.75)',
                            backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: 16,
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            style={{
                                width: '100%', maxWidth: 440, borderRadius: 24, padding: 24,
                                background: 'linear-gradient(135deg,rgba(15,20,50,0.98),rgba(20,15,45,0.98))',
                                border: '1px solid rgba(124,58,237,0.3)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#c084fc', fontWeight: 800, fontSize: 16 }}>
                                    <Bot size={20} /> AI শিক্ষক (Arena AI)
                                </div>
                                <button onClick={() => setAiOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 20 }}>✕</button>
                            </div>

                            {/* Query Input */}
                            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                                <input
                                    type="text"
                                    value={aiQuery}
                                    onChange={e => setAiQuery(e.target.value)}
                                    placeholder="আপনার প্রশ্ন লিখুন..."
                                    style={{
                                        flex: 1, padding: '10px 14px', borderRadius: 12,
                                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'white', fontSize: 13, outline: 'none',
                                    }}
                                />
                                <button
                                    onClick={askAiTeacher}
                                    disabled={aiLoading || !aiQuery.trim()}
                                    style={{
                                        padding: '10px 16px', borderRadius: 12, border: 'none',
                                        background: 'linear-gradient(135deg,#7c3aed,#4d6fff)',
                                        color: 'white', cursor: 'pointer', fontWeight: 700,
                                    }}
                                >
                                    {aiLoading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                                </button>
                            </div>

                            {/* Answer Box */}
                            <div style={{
                                minHeight: 120, maxHeight: 360, overflowY: 'auto', padding: 14, borderRadius: 14,
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                                color: 'rgba(255,255,255,0.9)', fontSize: 13, lineHeight: 1.6,
                                whiteSpace: 'pre-line',
                            }}>
                                {aiLoading ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.4)' }}>
                                        <Sparkles size={16} className="animate-spin" /> AI উত্তর তৈরি করছে...
                                    </div>
                                ) : aiAnswer ? (
                                    aiAnswer
                                ) : (
                                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>
                                        উপরের বক্সে আপনার প্রশ্ন লিখে পাঠান বা default প্রশ্নটি নিয়ে জিজ্ঞেস করুন।
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
