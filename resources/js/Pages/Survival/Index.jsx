import { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Heart, Skull, Trophy, Play, RotateCcw, AlertTriangle, Clock } from 'lucide-react';
import axios from 'axios';
import MobileLayout from '@/Layouts/MobileLayout';

export default function SurvivalIndex({ topPlayers = [] }) {
    const [gameState, setGameState]     = useState('idle'); // idle | playing | gameover
    const [questions, setQuestions]     = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore]             = useState(0);
    const [highScore, setHighScore]     = useState(() => parseInt(localStorage.getItem('survival_highscore') || '0'));
    const [timeLeft, setTimeLeft]       = useState(12);
    const [selectedOpt, setSelectedOpt] = useState(null);
    const [loading, setLoading]         = useState(false);

    const timerRef = useRef(null);
    const currentQ = questions[currentIndex];

    // Timer logic during play
    useEffect(() => {
        if (gameState === 'playing' && selectedOpt === null) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        handleGameOver('সময় শেষ!');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [gameState, currentIndex, selectedOpt]);

    const startMatch = async () => {
        setLoading(true);
        try {
            const res = await axios.get(route('survival.questions'));
            setQuestions(res.data.questions || []);
            setCurrentIndex(0);
            setScore(0);
            setSelectedOpt(null);
            setTimeLeft(12);
            setGameState('playing');
        } catch {
            alert('প্রশ্ন আনত্যে সমস্যা হয়েছে। আবার চেষ্টা করো!');
        }
        setLoading(false);
    };

    const handleSelect = (key) => {
        if (selectedOpt !== null || gameState !== 'playing') return;
        setSelectedOpt(key);
        clearInterval(timerRef.current);

        const isCorrect = key.toLowerCase() === currentQ.correct_answer.toLowerCase();

        if (isCorrect) {
            const newScore = score + 1;
            setScore(newScore);
            if (newScore > highScore) {
                setHighScore(newScore);
                localStorage.setItem('survival_highscore', newScore.toString());
            }

            // Move to next question after short delay
            setTimeout(() => {
                if (currentIndex + 1 < questions.length) {
                    setCurrentIndex(idx => idx + 1);
                    setSelectedOpt(null);
                    setTimeLeft(12);
                } else {
                    // Fetch more questions seamless
                    axios.get(route('survival.questions')).then(res => {
                        setQuestions(prev => [...prev, ...(res.data.questions || [])]);
                        setCurrentIndex(idx => idx + 1);
                        setSelectedOpt(null);
                        setTimeLeft(12);
                    });
                }
            }, 600);
        } else {
            setTimeout(() => {
                handleGameOver('ভুল উত্তর!');
            }, 700);
        }
    };

    const handleGameOver = (reason) => {
        setGameState('gameover');
    };

    return (
        <MobileLayout title="সারভাইভাল মোড">
            <Head title="সারভাইভাল — ExamArena" />

            <div style={{ padding: '16px', maxWidth: 520, margin: '0 auto', paddingBottom: 80 }}>

                <AnimatePresence mode="wait">

                    {/* ── IDLE STATE ──────────────────────────────────────────────── */}
                    {gameState === 'idle' && (
                        <motion.div key="idle" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                            {/* Banner Card */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(185,28,28,0.1))',
                                border: '1px solid rgba(239,68,68,0.3)', borderRadius: 24, padding: '24px 20px',
                                textAlign: 'center', marginBottom: 20, boxShadow: '0 10px 30px rgba(239,68,68,0.15)'
                            }}>
                                <div style={{
                                    width: 56, height: 56, borderRadius: '50%', margin: '0 auto 12px',
                                    background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 6px 20px rgba(239,68,68,0.4)',
                                }}>
                                    <Flame size={28} color="white" />
                                </div>
                                <h2 style={{ color: 'white', fontWeight: 900, fontSize: 22, margin: 0 }}>
                                    সারভাইভাল ডেথ-ম্যাচ 💀
                                </h2>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>
                                    ১টি ভুল উত্তর = গেম ওভার! প্রতি প্রশ্নের জন্য সময় ১২ সেকেন্ড। আপনি কত দূর যেতে পারবেন?
                                </p>

                                {/* Best Score Display */}
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                    marginTop: 16, padding: '8px 18px', borderRadius: 20,
                                    background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
                                }}>
                                    <Trophy size={16} color="#fbbf24" />
                                    <span style={{ color: '#fbbf24', fontSize: 13, fontWeight: 800 }}>
                                        তোমার সেরা স্কোর: {highScore}
                                    </span>
                                </div>
                            </div>

                            {/* Start Action */}
                            <motion.button
                                whileTap={{ scale: 0.96 }}
                                onClick={startMatch}
                                disabled={loading}
                                style={{
                                    width: '100%', padding: '16px', borderRadius: 16, border: 'none',
                                    background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                                    color: 'white', fontWeight: 900, fontSize: 16, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                    boxShadow: '0 6px 24px rgba(239,68,68,0.4)', marginBottom: 24,
                                }}
                            >
                                <Play size={20} fill="white" />
                                {loading ? 'প্রশ্ন লোড হচ্ছে...' : 'সারভাইভাল খেলা শুরু করো 🔥'}
                            </motion.button>

                            {/* Rules */}
                            <div style={{
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: 18, padding: '18px',
                            }}>
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                                    গেমের নিয়মাবলী
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                                    <div>⚡ প্রতিটি প্রশ্নের জন্য মাত্র ১২ সেকেন্ড বরাদ্দ।</div>
                                    <div>❌ ১টি ভুল উত্তর দিলেই গেম ওভার!</div>
                                    <div>🏆 পয়েন্ট প্রতি সঠিক উত্তরে +১ করে বাড়বে।</div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── PLAYING STATE ───────────────────────────────────────────── */}
                    {gameState === 'playing' && currentQ && (
                        <motion.div key="playing" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

                            {/* Top Bar: Timer & Live Score */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', padding: '6px 14px', borderRadius: 20 }}>
                                    <Clock size={16} color="#f87171" className={timeLeft <= 3 ? 'animate-bounce' : ''} />
                                    <span style={{ color: timeLeft <= 3 ? '#f87171' : 'white', fontWeight: 900, fontSize: 15 }}>
                                        {timeLeft}s
                                    </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', padding: '6px 14px', borderRadius: 20 }}>
                                    <Flame size={16} color="#fbbf24" />
                                    <span style={{ color: '#fbbf24', fontWeight: 900, fontSize: 15 }}>
                                        স্কোর: {score}
                                    </span>
                                </div>
                            </div>

                            {/* Timer Progress Bar */}
                            <div style={{ height: 6, width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden', marginBottom: 20 }}>
                                <div style={{
                                    height: '100%', width: `${(timeLeft / 12) * 100}%`,
                                    background: timeLeft <= 3 ? '#ef4444' : '#f59e0b', transition: 'width 1s linear',
                                }} />
                            </div>

                            {/* Question */}
                            <div style={{
                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                                borderRadius: 20, padding: '20px', marginBottom: 16
                            }}>
                                {currentQ.subject && (
                                    <span style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(239,68,68,0.12)', color: '#f87171', fontSize: 10, fontWeight: 700, display: 'inline-block', marginBottom: 10 }}>
                                        {currentQ.subject}
                                    </span>
                                )}
                                <h3 style={{ color: 'white', fontWeight: 700, fontSize: 16, lineHeight: 1.5, margin: 0 }}>
                                    {currentQ.question_text}
                                </h3>
                            </div>

                            {/* Options */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {Object.entries(currentQ.options || {}).map(([key, val]) => {
                                    const isSelected   = selectedOpt === key;
                                    const isCorrectOpt = key.toLowerCase() === currentQ.correct_answer.toLowerCase();
                                    const hasAnswered  = selectedOpt !== null;

                                    let border = '1px solid rgba(255,255,255,0.1)';
                                    let bg = 'rgba(255,255,255,0.03)';
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
                                            color = 'rgba(255,255,255,0.25)';
                                        }
                                    }

                                    return (
                                        <motion.button
                                            key={key}
                                            whileTap={!hasAnswered ? { scale: 0.98 } : {}}
                                            onClick={() => handleSelect(key)}
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
                                        </motion.button>
                                    );
                                })}
                            </div>

                        </motion.div>
                    )}

                    {/* ── GAME OVER STATE ─────────────────────────────────────────── */}
                    {gameState === 'gameover' && (
                        <motion.div key="gameover" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{ fontSize: 64, marginBottom: 12 }}>💀</div>
                            <h2 style={{ color: '#f87171', fontWeight: 900, fontSize: 26, margin: 0 }}>
                                গেম ওভার!
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 4 }}>
                                সারভাইভাল মোড শেষ হয়ে গেছে
                            </p>

                            {/* Score Card */}
                            <div style={{
                                width: 140, height: 140, borderRadius: '50%', margin: '24px auto',
                                background: 'linear-gradient(135deg,rgba(239,68,68,0.2),rgba(185,28,28,0.1))',
                                border: '2px solid rgba(239,68,68,0.4)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 10px 30px rgba(239,68,68,0.2)',
                            }}>
                                <span style={{ color: 'white', fontSize: 42, fontWeight: 900, lineHeight: 1 }}>{score}</span>
                                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>স্কোর</span>
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.96 }}
                                onClick={startMatch}
                                style={{
                                    width: '100%', padding: '16px', borderRadius: 16, border: 'none',
                                    background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                                    color: 'white', fontWeight: 900, fontSize: 16, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    boxShadow: '0 6px 20px rgba(239,68,68,0.4)', marginBottom: 12,
                                }}
                            >
                                <RotateCcw size={18} /> আবার খেলো
                            </motion.button>
                        </motion.div>
                    )}

                </AnimatePresence>

            </div>
        </MobileLayout>
    );
}
