import { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, CheckCircle2, XCircle, HelpCircle,
         Bookmark, Share2, Sparkles, Trophy, Flame, RefreshCw, Layers, Clock, X, Flag, PlayCircle } from 'lucide-react';
import MobileLayout from '@/Layouts/MobileLayout';
import Swal from 'sweetalert2';

const GOALS = [
    { value: 'all', label: 'সব পরীক্ষা' },
    { value: 'bcs', label: 'BCS' },
    { value: 'hsc', label: 'HSC' },
    { value: 'ssc', label: 'SSC' },
    { value: 'medical', label: 'Medical' },
    { value: 'bank', label: 'Bank' },
    { value: 'university', label: 'University' },
    { value: 'primary', label: 'Primary' },
    { value: 'ntrca', label: 'NTRCA' },
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

function AdsterraBanner({ scriptCode }) {
    const defaultCode = `
        <style>body{margin:0;padding:0;display:flex;justify-content:center;align-items:center;background:transparent;}</style>
        <script>
          atOptions = {
            'key' : 'b7c4685fce9282287defd9cd0dd99097',
            'format' : 'iframe',
            'height' : 250,
            'width' : 300,
            'params' : {}
          };
        </script>
        <script src="https://www.highperformanceformat.com/b7c4685fce9282287defd9cd0dd99097/invoke.js"></script>
    `;
    const codeToRender = scriptCode || defaultCode;

    return (
        <iframe
            title="Adsterra Banner"
            srcDoc={codeToRender}
            style={{ width: 300, height: 250, border: 'none', overflow: 'hidden', margin: '0 auto', borderRadius: 12 }}
            scrolling="no"
        />
    );
}

export default function ReelIndex({ initialQuestions = [], currentGoal = 'bcs', userGoal = 'bcs', adsterraScript = '' }) {
    const [questions, setQuestions]     = useState(initialQuestions);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedGoal, setSelectedGoal] = useState(currentGoal);
    const [answers, setAnswers]         = useState({}); // { [qId]: selectedOpt }
    const [showExplanation, setShowExp] = useState({}); // { [qId]: boolean }
    const [bookmarked, setBookmarked]   = useState({}); // { [qId]: boolean }
    const [score, setScore]             = useState(0);
    const [streak, setStreak]           = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);

    // Interstitial Ad State (Every 5 questions)
    const [qCountSinceAd, setQCountSinceAd] = useState(0);
    const [adModal, setAdModal]             = useState(false);
    const [adTimer, setAdTimer]             = useState(5);
    const [adSkippable, setAdSkippable]     = useState(false);
    const [pendingIndex, setPendingIndex]   = useState(null);

    // Dispute Modal
    const [disputeModal, setDisputeModal] = useState(false);
    const [disputeNote, setDisputeNote]   = useState('');
    const [submittingDispute, setSubmittingDispute] = useState(false);

    const currentQ = questions[currentIndex];

    // Auto-fetch if initialQuestions is empty
    useEffect(() => {
        if (!questions || questions.length === 0) {
            fetchMore(selectedGoal);
        }
    }, [selectedGoal]);

    // Fetch more questions when approaching end
    const fetchMore = async (goal) => {
        if (loadingMore) return;
        setLoadingMore(true);
        try {
            const res = await fetch(`/api/reel/questions?goal=${goal || 'bcs'}&count=10`);
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

    // Ad Timer Effect
    useEffect(() => {
        let interval = null;
        if (adModal && adTimer > 0) {
            interval = setInterval(() => {
                setAdTimer(t => {
                    if (t <= 1) {
                        clearInterval(interval);
                        setAdSkippable(true);
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [adModal, adTimer]);

    const triggerAd = (targetIdx) => {
        setPendingIndex(targetIdx);
        setAdTimer(5);
        setAdSkippable(false);
        setAdModal(true);
    };

    const skipAd = () => {
        setAdModal(false);
        if (pendingIndex !== null) {
            setCurrentIndex(pendingIndex);
            setPendingIndex(null);
        }
    };

    const nextQuestion = () => {
        if (adModal) return;
        const nextIdx = currentIndex + 1;
        const newCount = qCountSinceAd + 1;

        if (newCount >= 5) {
            setQCountSinceAd(0);
            triggerAd(nextIdx);
            return;
        }

        setQCountSinceAd(newCount);
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(nextIdx);
            if (currentIndex >= questions.length - 3) {
                fetchMore(selectedGoal);
            }
        }
    };

    const prevQuestion = () => {
        if (adModal) return;
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
        if (answers[qId]) return;

        const isCorrect = optionKey.toLowerCase() === correctKey.toLowerCase();
        setAnswers(prev => ({ ...prev, [qId]: optionKey }));

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
            Swal.fire({
                icon: 'info',
                title: 'উত্তর দিন',
                text: 'উত্তর নির্বাচন করার পর ব্যাখ্যা দেখতে পাবেন!',
                confirmButtonColor: '#4d6fff',
            });
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
            Swal.fire({
                icon: 'success',
                title: 'কপি হয়েছে',
                text: 'প্রশ্ন লিংক ক্লিওবোর্ডে কপি করা হয়েছে!',
                timer: 2000,
                showConfirmButton: false,
            });
        }
    };

    const submitDispute = async () => {
        if (!currentQ) return;
        setSubmittingDispute(true);
        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
            await fetch('/disputes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf, 'Accept': 'application/json' },
                body: JSON.stringify({
                    question_id: currentQ.id,
                    reason: disputeNote || 'প্রশ্নে ভুল রয়েছে',
                }),
            });
            setDisputeModal(false);
            setDisputeNote('');
            Swal.fire({
                icon: 'success',
                title: 'রিপোর্ট জমা হয়েছে',
                text: 'আপনার রিপোর্ট সফলভাবে অ্যাডমিনের কাছে পাঠানো হয়েছে।',
                confirmButtonColor: '#10b981',
            });
        } catch {
            Swal.fire({ icon: 'error', title: 'ব্যর্থ হয়েছে', text: 'রিপোর্ট পাঠাতে সমস্যা হয়েছে।' });
        }
        setSubmittingDispute(false);
    };

    return (
        <MobileLayout activeTab="reel">
            <Head title="MCQ Reel — ExamArena" />

            <div
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onWheel={handleWheel}
                style={{
                    minHeight: 'calc(100vh - 120px)',
                    maxWidth: 520, margin: '0 auto',
                    display: 'flex', flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '12px 16px 80px',
                    position: 'relative',
                    userSelect: 'none',
                }}
            >
                {/* ── STATS BAR ───────────────────────────────────────────────── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Trophy size={14} /> {score} pt
                        </span>
                        {streak > 1 && (
                            <span style={{ color: '#f97316', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Flame size={14} /> {streak} streak!
                            </span>
                        )}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700 }}>
                        {currentIndex + 1} / {questions.length}
                    </div>
                </div>

                {/* ── QUESTION CARD ──────────────────────────────────────────────── */}
                {!currentQ && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'white', background: 'rgba(255,255,255,0.03)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Sparkles size={36} color="#93b4ff" style={{ margin: '0 auto 12px' }} />
                        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>প্রশ্ন লোড হচ্ছে...</h3>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>অনুগ্রহ করে অপেক্ষা করুন অথবা রিফ্রেশ বাটনে চাপ দিন</p>
                        <button onClick={() => fetchMore(selectedGoal)} style={{ marginTop: 14, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#4d6fff,#7c3aed)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                            প্রশ্ন রিফ্রেশ করো
                        </button>
                    </div>
                )}
                <AnimatePresence mode="wait">
                    {currentQ && (
                        <motion.div
                            key={currentQ.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.22 }}
                            style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.09)',
                                borderRadius: 24, padding: '20px 18px',
                                backdropFilter: 'blur(20px)',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                                margin: '8px 0',
                            }}
                        >
                            {/* Badges & Meta */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <DiffBadge level={currentQ.difficulty_level} />
                                    <YearBadge year={currentQ.board_year} />
                                    {currentQ.subject && (
                                        <span style={{ padding: '2px 8px', borderRadius: 8, background: 'rgba(147,180,255,0.15)', color: '#93b4ff', fontSize: 10, fontWeight: 700 }}>
                                            {currentQ.subject}
                                        </span>
                                    )}
                                </div>
                                <button onClick={() => setDisputeModal(true)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Flag size={13} /> রিপোর্ট
                                </button>
                            </div>

                            {/* Question Text */}
                            <h2 style={{ color: 'white', fontWeight: 800, fontSize: 17, lineHeight: 1.5, marginBottom: 16 }}>
                                {currentQ.question_text}
                            </h2>

                            {/* Image if available */}
                            {currentQ.image_url && (
                                <img
                                    src={currentQ.image_url} alt="Question"
                                    style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 14, marginBottom: 16 }}
                                />
                            )}

                            {/* Options */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {Object.entries(currentQ.options ?? {}).map(([key, optText]) => {
                                    const answered = !!answers[currentQ.id];
                                    const selected = answers[currentQ.id] === key;
                                    const isCorrect = key.toLowerCase() === currentQ.correct_answer.toLowerCase();

                                    let bg = 'rgba(255,255,255,0.05)';
                                    let border = '1px solid rgba(255,255,255,0.1)';
                                    let textColor = 'white';

                                    if (answered) {
                                        if (isCorrect) {
                                            bg = 'rgba(16,185,129,0.2)';
                                            border = '1.5px solid #10b981';
                                            textColor = '#34d399';
                                        } else if (selected) {
                                            bg = 'rgba(239,68,68,0.2)';
                                            border = '1.5px solid #ef4444';
                                            textColor = '#f87171';
                                        }
                                    }

                                    return (
                                        <motion.button
                                            key={key}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleSelectOption(currentQ.id, key, currentQ.correct_answer)}
                                            style={{
                                                padding: '13px 16px', borderRadius: 16,
                                                background: bg, border: border,
                                                color: textColor, fontWeight: 700, fontSize: 14,
                                                textAlign: 'left', cursor: answered ? 'default' : 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            <span><strong style={{ opacity: 0.7, marginRight: 8 }}>{key.toUpperCase()}.</strong> {optText}</span>
                                            {answered && isCorrect && <CheckCircle2 size={18} color="#34d399" />}
                                            {answered && selected && !isCorrect && <XCircle size={18} color="#f87171" />}
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* Explanation Dropdown */}
                            {answers[currentQ.id] && currentQ.explanation && (
                                <div style={{ marginTop: 14 }}>
                                    <button
                                        onClick={() => toggleExp(currentQ.id)}
                                        style={{
                                            padding: '8px 14px', borderRadius: 12, border: 'none',
                                            background: 'rgba(77,111,255,0.15)', color: '#93b4ff',
                                            fontWeight: 700, fontSize: 12, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: 6,
                                        }}
                                    >
                                        <HelpCircle size={14} /> {showExplanation[currentQ.id] ? 'ব্যাখ্যা লুকান' : 'ব্যাখ্যা দেখুন 💡'}
                                    </button>

                                    {showExplanation[currentQ.id] && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            style={{
                                                padding: '12px 14px', borderRadius: 14,
                                                background: 'rgba(77,111,255,0.08)', border: '1px solid rgba(77,111,255,0.2)',
                                                color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 1.6, marginTop: 10,
                                            }}
                                        >
                                            {currentQ.explanation}
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {/* Actions Bar */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <button
                                    onClick={() => toggleBookmark(currentQ.id)}
                                    style={{ background: 'none', border: 'none', color: bookmarked[currentQ.id] ? '#fbbf24' : 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700 }}
                                >
                                    <Bookmark size={16} fill={bookmarked[currentQ.id] ? '#fbbf24' : 'none'} /> সেভ করো
                                </button>
                                <button
                                    onClick={() => shareQuestion(currentQ)}
                                    style={{ background: 'none', border: 'none', color: '#93b4ff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700 }}
                                >
                                    <Share2 size={16} /> শেয়ার করো
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── BOTTOM NAVIGATION CONTROLS ─────────────────────────────────── */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 12 }}>
                    <button
                        onClick={prevQuestion}
                        disabled={currentIndex === 0}
                        style={{
                            padding: '12px 24px', borderRadius: 20, border: 'none',
                            background: currentIndex === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                            color: currentIndex === 0 ? 'rgba(255,255,255,0.2)' : 'white',
                            fontWeight: 800, fontSize: 14, cursor: currentIndex === 0 ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}
                    >
                        <ChevronUp size={18} /> পূর্ববর্তী
                    </button>

                    <button
                        onClick={nextQuestion}
                        disabled={currentIndex >= questions.length - 1}
                        style={{
                            padding: '12px 28px', borderRadius: 20, border: 'none',
                            background: 'linear-gradient(135deg,#4d6fff,#7c3aed)',
                            color: 'white', fontWeight: 800, fontSize: 14, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 6,
                            boxShadow: '0 6px 20px rgba(77,111,255,0.35)',
                        }}
                    >
                        পরবর্তী <ChevronDown size={18} />
                    </button>
                </div>
            </div>

            {/* ── INTERSTITIAL AD MODAL (EVERY 5 QUESTIONS) ─────────────────────── */}
            <AnimatePresence>
                {adModal && (
                    <div style={{
                        position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.92)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
                        backdropFilter: 'blur(12px)',
                    }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{
                                width: '100%', maxWidth: 360, borderRadius: 24, padding: 20,
                                background: '#0d1127', border: '1px solid rgba(77,111,255,0.4)',
                                color: 'white', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
                            }}
                        >
                            <div style={{ color: '#fbbf24', fontWeight: 900, fontSize: 15, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                <PlayCircle size={18} color="#fbbf24" /> স্পন্সরড বিজ্ঞাপন
                            </div>

                            {/* Banner container */}
                            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 14, padding: '10px 0', marginBottom: 16, minHeight: 255 }}>
                                <AdsterraBanner scriptCode={adsterraScript} />
                            </div>

                            {/* Timer / Skip Button */}
                            {!adSkippable ? (
                                <div style={{
                                    padding: '12px', borderRadius: 14, background: 'rgba(255,255,255,0.05)',
                                    color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                }}>
                                    <Clock size={16} color="#fbbf24" />
                                    এড়িয়ে যেতে বাকি: <span style={{ color: '#fbbf24', fontSize: 16, fontWeight: 900 }}>{adTimer}s</span>
                                </div>
                            ) : (
                                <button
                                    onClick={skipAd}
                                    style={{
                                        width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                                        background: 'linear-gradient(135deg,#4d6fff,#7c3aed)',
                                        color: 'white', fontWeight: 900, fontSize: 15, cursor: 'pointer',
                                        boxShadow: '0 4px 18px rgba(77,111,255,0.4)',
                                    }}
                                >
                                    ⏩ এড়িয়ে যান (Skip Ad)
                                </button>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── DISPUTE MODAL ─────────────────────────────────────────────────── */}
            <AnimatePresence>
                {disputeModal && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(8px)' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            style={{ width: '100%', maxWidth: 400, borderRadius: 20, padding: 20, background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#f87171', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Flag size={18} /> প্রশ্নে ভুল রিপোর্ট করুন
                                </h3>
                                <button onClick={() => setDisputeModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}><X size={18} /></button>
                            </div>
                            <textarea
                                value={disputeNote} onChange={e => setDisputeNote(e.target.value)}
                                placeholder="কী ভুল আছে সংক্ষেপে লিখুন (যেমন: অপশন B হবে, টাইপো ইত্যাদি)..."
                                rows={4}
                                style={{ width: '100%', padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                            />
                            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                                <button onClick={() => setDisputeModal(false)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>বাতিল</button>
                                <button onClick={submitDispute} disabled={submittingDispute} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#ef4444', color: 'white', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
                                    {submittingDispute ? 'পাঠানো হচ্ছে...' : 'রিপোর্ট পাঠান'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </MobileLayout>
    );
}
