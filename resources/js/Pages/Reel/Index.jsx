import { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, CheckCircle2, XCircle, HelpCircle,
         Bookmark, Share2, Sparkles, Trophy, Flame, RefreshCw, Layers } from 'lucide-react';
import MobileLayout from '@/Layouts/MobileLayout';

const GOALS = [
    { value: 'all', label: 'সব পরীক্ষা' },
    { value: 'bcs', label: 'BCS' },
    { value: 'hsc', label: 'HSC' },
    { value: 'ssc', label: 'SSC' },
    { value: 'medical', label: 'Medical' },
    { value: 'bank', label: 'Bank' },
    { value: 'university', label: 'University' },
    { value: 'primary', label: 'Primary' },
];

function DiffBadge({ level }) {
    const colors = { LOW: '#34d399', MEDIUM: '#fbbf24', HIGH: '#f87171' };
    return (
        <span style={{
            padding: '2px 8px', borderRadius: 8, fontSize: 10, fontWeight: 700,
            background: `${colors[level] ?? '#fbbf24'}22`,
            color: colors[level] ?? '#fbbf24',
            border: `1px solid ${colors[level] ?? '#fbbf24'}44`
        }}>
            {level ?? 'MEDIUM'}
        </span>
    );
}

function YearBadge({ year }) {
    if (year && year.toUpperCase() !== 'NEW') {
        return <span style={{ padding: '2px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>{year}</span>;
    }
    return <span style={{ padding: '2px 8px', borderRadius: 8, background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', fontSize: 10, fontWeight: 700 }}>NEW</span>;
}

export default function ReelIndex({ initialQuestions = [], currentGoal = 'bcs', userGoal = 'bcs' }) {
    const [questions, setQuestions]     = useState(initialQuestions);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedGoal, setSelectedGoal] = useState(currentGoal);
    const [answers, setAnswers]         = useState({}); // { [qId]: selectedOpt }
    const [showExplanation, setShowExp] = useState({}); // { [qId]: boolean }
    const [bookmarked, setBookmarked]   = useState({}); // { [qId]: boolean }
    const [score, setScore]             = useState(0);
    const [streak, setStreak]           = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);

    const currentQ = questions[currentIndex];

    // Fetch more questions when approaching end
    const fetchMore = async (goal) => {
        if (loadingMore) return;
        setLoadingMore(true);
        try {
            const res = await fetch(`/api/reel/questions?goal=${goal}&count=10`);
            const data = await res.json();
            if (data.questions?.length) {
                setQuestions(prev => [...prev, ...data.questions]);
            }
        } catch {}
        setLoadingMore(false);
    };

    // Change Goal
    const handleGoalChange = (newGoal) => {
        setSelectedGoal(newGoal);
        setCurrentIndex(0);
        setAnswers({});
        setShowExp({});
        router.visit(route('reel.index', { goal: newGoal }), { preserveState: false });
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(idx => idx + 1);
            if (currentIndex >= questions.length - 3) {
                fetchMore(selectedGoal);
            }
        }
    };

    const prevQuestion = () => {
        if (currentIndex > 0) {
            setCurrentIndex(idx => idx - 1);
        }
    };

    const [touchStartY, setTouchStartY] = useState(0);

    const handleTouchStart = (e) => {
        setTouchStartY(e.touches[0].clientY);
    };

    const handleTouchEnd = (e) => {
        const touchEndY = e.changedTouches[0].clientY;
        const diffY = touchStartY - touchEndY;

        // Swipe Up -> Next question, Swipe Down -> Prev question
        if (diffY > 50) {
            nextQuestion();
        } else if (diffY < -50) {
            prevQuestion();
        }
    };

    const handleWheel = (e) => {
        if (e.deltaY > 30) {
            nextQuestion();
        } else if (e.deltaY < -30) {
            prevQuestion();
        }
    };

    // Answer Selection
    const handleSelectOption = (qId, optionKey, correctKey) => {
        if (answers[qId]) return; // already answered

        const isCorrect = optionKey.toLowerCase() === correctKey.toLowerCase();
        setAnswers(prev => ({ ...prev, [qId]: optionKey }));
        setShowExp(prev => ({ ...prev, [qId]: true })); // Reveal explanation ON ANY ANSWER

        if (isCorrect) {
            setScore(s => s + 10);
            setStreak(st => st + 1);
        } else {
            setStreak(0);
        }
    };

    const toggleBookmark = (qId) => {
        setBookmarked(prev => ({ ...prev, [qId]: !prev[qId] }));
    };

    const toggleExp = (qId) => {
        if (!answers[qId]) {
            alert('উত্তর নির্বাচন করার পর ব্যাখ্যা দেখতে পাবেন!');
            return;
        }
        setShowExp(prev => ({ ...prev, [qId]: !prev[qId] }));
    };

    const shareQuestion = (q) => {
        if (navigator.share) {
            navigator.share({
                title: 'ExamArena Reel Question',
                text: `${q.question_text}\n\nExamArena-এ প্র্যাকটিস করো!`,
                url: window.location.href,
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(`${q.question_text}\n\nExamArena`);
            alert('প্রশ্ন লিংক কপি করা হয়েছে!');
        }
    };

    return (
        <MobileLayout activeTab="reel">
            <Head title="MCQ Reel — ExamArena" />

            <div style={{
                position: 'fixed', inset: 0, bottom: 64,
                background: 'linear-gradient(180deg, #070919 0%, #0c1025 100%)',
                display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}>

                {/* ── Top Header / Goal Selector Bar ────────────────────────────── */}
                <div style={{
                    padding: '12px 16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'rgba(12,16,37,0.85)', backdropFilter: 'blur(16px)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)', zIndex: 50
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', paddingRight: 8, scrollbarWidth: 'none' }}>
                        {GOALS.map(g => (
                            <button
                                key={g.value}
                                onClick={() => handleGoalChange(g.value)}
                                style={{
                                    padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                                    whiteSpace: 'nowrap', cursor: 'pointer', border: 'none',
                                    background: selectedGoal === g.value ? 'linear-gradient(135deg, #4d6fff, #7c3aed)' : 'rgba(255,255,255,0.06)',
                                    color: selectedGoal === g.value ? 'white' : 'rgba(255,255,255,0.45)',
                                    boxShadow: selectedGoal === g.value ? '0 2px 10px rgba(77,111,255,0.3)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {g.label}
                            </button>
                        ))}
                    </div>

                    {/* Streak & Score Counter */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', padding: '4px 8px', borderRadius: 12 }}>
                            <Flame size={13} color="#f59e0b" />
                            <span style={{ color: '#fbbf24', fontSize: 11, fontWeight: 800 }}>{streak}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', padding: '4px 8px', borderRadius: 12 }}>
                            <Trophy size={13} color="#34d399" />
                            <span style={{ color: '#34d399', fontSize: 11, fontWeight: 800 }}>{score}</span>
                        </div>
                    </div>
                </div>

                {/* ── Main Reel Slide Content ──────────────────────────────────── */}
                <div
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onWheel={handleWheel}
                    style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'pan-y' }}
                >
                    <AnimatePresence mode="wait">
                        {currentQ ? (
                            <motion.div
                                key={currentQ.id}
                                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -40, scale: 0.96 }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                style={{
                                    width: '100%', height: '100%', padding: '16px 20px',
                                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                                    maxWidth: 520, margin: '0 auto'
                                }}
                            >
                                {/* Question Metadata Badges */}
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                                    <span style={{ padding: '2px 8px', borderRadius: 8, background: 'rgba(77,111,255,0.12)', color: '#93b4ff', fontSize: 10, fontWeight: 700 }}>
                                        {currentQ.exam_goal?.toUpperCase()}
                                    </span>
                                    <DiffBadge level={currentQ.difficulty_level} />
                                    <YearBadge year={currentQ.board_year} />
                                    {currentQ.subject && (
                                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 500 }}>
                                            • {currentQ.subject}
                                        </span>
                                    )}
                                </div>

                                {/* Question Text */}
                                <div style={{
                                    color: 'white', fontSize: 16, fontWeight: 700, lineHeight: 1.55,
                                    marginBottom: 20, textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                                }}>
                                    {currentQ.question_text}
                                </div>

                                {/* Options List */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                                    {Object.entries(currentQ.options ?? {}).map(([key, val]) => {
                                        const isSelected = answers[currentQ.id] === key;
                                        const isCorrectOpt = key.toLowerCase() === currentQ.correct_answer?.toLowerCase();
                                        const hasAnswered = !!answers[currentQ.id];

                                        let border = '1px solid rgba(255,255,255,0.08)';
                                        let bg = 'rgba(255,255,255,0.03)';
                                        let color = 'rgba(255,255,255,0.85)';

                                        if (hasAnswered) {
                                            if (isCorrectOpt) {
                                                border = '1px solid rgba(52,211,153,0.5)';
                                                bg = 'rgba(52,211,153,0.12)';
                                                color = '#34d399';
                                            } else if (isSelected && !isCorrectOpt) {
                                                border = '1px solid rgba(239,68,68,0.5)';
                                                bg = 'rgba(239,68,68,0.12)';
                                                color = '#f87171';
                                            } else {
                                                color = 'rgba(255,255,255,0.25)';
                                            }
                                        }

                                        return (
                                            <motion.button
                                                key={key}
                                                whileHover={!hasAnswered ? { scale: 1.01 } : {}}
                                                whileTap={!hasAnswered ? { scale: 0.98 } : {}}
                                                onClick={() => handleSelectOption(currentQ.id, key, currentQ.correct_answer)}
                                                disabled={hasAnswered}
                                                style={{
                                                    padding: '13px 16px', borderRadius: 14,
                                                    display: 'flex', alignItems: 'center', gap: 12,
                                                    background: bg, border: border, color: color,
                                                    cursor: hasAnswered ? 'default' : 'pointer',
                                                    textAlign: 'left', transition: 'all 0.15s'
                                                }}
                                            >
                                                <div style={{
                                                    width: 26, height: 26, borderRadius: 8,
                                                    background: hasAnswered && isCorrectOpt ? '#34d399' : (hasAnswered && isSelected ? '#ef4444' : 'rgba(255,255,255,0.06)'),
                                                    color: hasAnswered && (isCorrectOpt || isSelected) ? 'white' : 'rgba(255,255,255,0.5)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 800, fontSize: 12, flexShrink: 0
                                                }}>
                                                    {key.toUpperCase()}
                                                </div>
                                                <div style={{ flex: 1, fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>
                                                    {val}
                                                </div>
                                                {hasAnswered && isCorrectOpt && <CheckCircle2 size={18} color="#34d399" />}
                                                {hasAnswered && isSelected && !isCorrectOpt && <XCircle size={18} color="#f87171" />}
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Explanation Box */}
                                <AnimatePresence>
                                    {showExplanation[currentQ.id] && currentQ.explanation && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            style={{
                                                padding: '12px 14px', borderRadius: 12,
                                                background: 'rgba(124,58,237,0.08)',
                                                border: '1px solid rgba(124,58,237,0.2)',
                                                color: 'rgba(255,255,255,0.8)', fontSize: 12, lineHeight: 1.6,
                                                marginBottom: 10, overflow: 'hidden'
                                            }}
                                        >
                                            <div style={{ color: '#c084fc', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                💡 ব্যাখ্যা:
                                            </div>
                                            {currentQ.explanation}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: 30, color: 'rgba(255,255,255,0.3)' }}>
                                <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px' }} />
                                <div style={{ fontSize: 14 }}>প্রশ্ন লোড হচ্ছে...</div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Right Side Action Floating Bar */}
                    {currentQ && (
                        <div style={{
                            position: 'absolute', right: 12, bottom: 20,
                            display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center',
                            zIndex: 40
                        }}>
                            {/* Bookmark button */}
                            <button
                                onClick={() => toggleBookmark(currentQ.id)}
                                style={{
                                    width: 42, height: 42, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)',
                                    background: bookmarked[currentQ.id] ? 'rgba(77,111,255,0.25)' : 'rgba(12,16,37,0.75)',
                                    backdropFilter: 'blur(10px)', color: bookmarked[currentQ.id] ? '#93b4ff' : 'rgba(255,255,255,0.6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                }}
                            >
                                <Bookmark size={18} fill={bookmarked[currentQ.id] ? '#93b4ff' : 'none'} />
                            </button>

                            {/* Explanation toggle button */}
                            <button
                                onClick={() => toggleExp(currentQ.id)}
                                style={{
                                    width: 42, height: 42, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)',
                                    background: showExplanation[currentQ.id] ? 'rgba(124,58,237,0.25)' : 'rgba(12,16,37,0.75)',
                                    backdropFilter: 'blur(10px)', color: showExplanation[currentQ.id] ? '#c084fc' : 'rgba(255,255,255,0.6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                }}
                            >
                                <HelpCircle size={18} />
                            </button>

                            {/* Share button */}
                            <button
                                onClick={() => shareQuestion(currentQ)}
                                style={{
                                    width: 42, height: 42, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(12,16,37,0.75)', backdropFilter: 'blur(10px)',
                                    color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                }}
                            >
                                <Share2 size={18} />
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Bottom Vertical Navigation Control ────────────────────────── */}
                <div style={{
                    padding: '10px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'rgba(12,16,37,0.85)', backdropFilter: 'blur(16px)',
                    borderTop: '1px solid rgba(255,255,255,0.06)'
                }}>
                    <button
                        onClick={prevQuestion}
                        disabled={currentIndex === 0}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 12,
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                            color: currentIndex === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
                            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600
                        }}
                    >
                        <ChevronUp size={16} /> আগের প্রশ্ন
                    </button>

                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 600 }}>
                        {currentIndex + 1} / {questions.length}
                    </div>

                    <button
                        onClick={nextQuestion}
                        disabled={currentIndex >= questions.length - 1}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 12,
                            background: 'linear-gradient(135deg, #4d6fff, #7c3aed)', border: 'none',
                            color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                            boxShadow: '0 2px 10px rgba(77,111,255,0.3)'
                        }}
                    >
                        পরের প্রশ্ন <ChevronDown size={16} />
                    </button>
                </div>
            </div>
        </MobileLayout>
    );
}
