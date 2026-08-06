import { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Trophy, Clock, CheckCircle2, XCircle, Users, RefreshCw } from 'lucide-react';
import axios from 'axios';
import MobileLayout from '@/Layouts/MobileLayout';

export default function BattleRoom({ invite, session: initialSession, userId }) {
    const questions = invite.questions_snapshot || [];
    const [index, setIndex]             = useState(0);
    const [selectedOpt, setSelectedOpt] = useState(null);
    const [myScore, setMyScore]         = useState(0);
    const [opponentScore, setOpponentScore] = useState(0);
    const [timeLeft, setTimeLeft]       = useState(10);
    const [isCompleted, setIsCompleted] = useState(false);
    const [winner, setWinner]           = useState(null);

    const timerRef = useRef(null);
    const pollRef  = useRef(null);
    const currentQ = questions[index];

    const isSender = userId === invite.sender_id;
    const opponentName = isSender ? (invite.receiver?.name || 'প্রতিপক্ষ') : (invite.sender?.name || 'প্রতিপক্ষ');

    // Timer per question (10s)
    useEffect(() => {
        if (!isCompleted && selectedOpt === null) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        nextQuestion();
                        return 10;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [index, selectedOpt, isCompleted]);

    // Poll live scores every 2 seconds
    useEffect(() => {
        pollRef.current = setInterval(() => {
            fetchLiveStatus();
        }, 2000);

        return () => clearInterval(pollRef.current);
    }, [index, myScore]);

    const fetchLiveStatus = async () => {
        try {
            const res = await axios.post(route('battle.submit-answer', invite.id), {
                score: myScore,
                is_finished: isCompleted,
            });

            if (res.data.session) {
                const s = res.data.session;
                if (isSender) {
                    setOpponentScore(s.receiver_score || 0);
                } else {
                    setOpponentScore(s.sender_score || 0);
                }

                if (s.status === 'COMPLETED') {
                    setIsCompleted(true);
                    setWinner(s.winner_id);
                }
            }
        } catch {}
    };

    const handleSelectOption = (key) => {
        if (selectedOpt !== null || isCompleted) return;
        setSelectedOpt(key);
        clearInterval(timerRef.current);

        const isCorrect = key.toLowerCase() === currentQ.correct_answer.toLowerCase();
        let newScore = myScore;
        if (isCorrect) {
            newScore += 1;
            setMyScore(newScore);
        }

        setTimeout(() => {
            nextQuestion(newScore);
        }, 600);
    };

    const nextQuestion = (currentMyScore = myScore) => {
        if (index + 1 < questions.length) {
            setIndex(idx => idx + 1);
            setSelectedOpt(null);
            setTimeLeft(10);
        } else {
            // End of 10 questions
            setIsCompleted(true);
            axios.post(route('battle.submit-answer', invite.id), {
                score: currentMyScore,
                is_finished: true,
            }).then(res => {
                if (res.data.session) {
                    setWinner(res.data.session.winner_id);
                }
            });
        }
    };

    return (
        <MobileLayout title="১v১ ব্যাটেল অ্যারেনা">
            <Head title="১v১ ব্যাটেল অ্যারেনা — ExamArena" />

            <div style={{ padding: '16px', maxWidth: 520, margin: '0 auto', paddingBottom: 80 }}>

                {/* Scoreboard Header */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(15,20,50,0.95), rgba(25,15,40,0.95))',
                    border: '1px solid rgba(245,158,11,0.3)', borderRadius: 20, padding: '16px 20px',
                    marginBottom: 20, boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                        {/* My Score */}
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700 }}>আপনি (আপনি)</div>
                            <div style={{ color: '#34d399', fontWeight: 900, fontSize: 26, marginTop: 2 }}>{myScore}</div>
                        </div>

                        {/* VS Center */}
                        <div style={{ textAlign: 'center', padding: '0 14px' }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
                                color: 'white', fontWeight: 900, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 4px', boxShadow: '0 2px 10px rgba(245,158,11,0.4)'
                            }}>
                                VS
                            </div>
                            <div style={{ color: '#f87171', fontSize: 13, fontWeight: 800 }}>
                                ⏱ {timeLeft}s
                            </div>
                        </div>

                        {/* Opponent Score */}
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {opponentName}
                            </div>
                            <div style={{ color: '#f87171', fontWeight: 900, fontSize: 26, marginTop: 2 }}>{opponentScore}</div>
                        </div>

                    </div>
                </div>

                {/* Main Battle Room State */}
                <AnimatePresence mode="wait">
                    {!isCompleted && currentQ ? (
                        <motion.div key={currentQ.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                            {/* Question Card */}
                            <div style={{
                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                                borderRadius: 20, padding: '20px', marginBottom: 16,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700 }}>
                                        প্রশ্ন {index + 1} / {questions.length}
                                    </span>
                                    {currentQ.subject && (
                                        <span style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(245,158,11,0.15)', color: '#fbbf24', fontSize: 10, fontWeight: 700 }}>
                                            {currentQ.subject}
                                        </span>
                                    )}
                                </div>
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
                                        }
                                    }

                                    return (
                                        <motion.button
                                            key={key}
                                            whileTap={!hasAnswered ? { scale: 0.98 } : {}}
                                            onClick={() => handleSelectOption(key)}
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
                    ) : (
                        <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '30px 0' }}>
                            <div style={{ fontSize: 64, marginBottom: 12 }}>
                                {winner === userId ? '🏆' : (winner ? '💔' : '🤝')}
                            </div>
                            <h2 style={{ color: winner === userId ? '#34d399' : (winner ? '#f87171' : '#fbbf24'), fontWeight: 900, fontSize: 26, margin: 0 }}>
                                {winner === userId ? 'আপনি বিজয়ী হয়েছেন! 🎉' : (winner ? 'প্রতিপক্ষ বিজয়ী হয়েছে!' : 'ম্যাচটি ড্র হয়েছে!')}
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 6 }}>
                                আপনার স্কোর: {myScore} · প্রতিপক্ষের স্কোর: {opponentScore}
                            </p>

                            <Link
                                href={route('battle.index')}
                                style={{
                                    display: 'inline-block', marginTop: 24, padding: '14px 24px', borderRadius: 14,
                                    background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white',
                                    fontWeight: 800, fontSize: 15, textDecoration: 'none',
                                }}
                            >
                                ← লবিতে ফিরে যান
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </MobileLayout>
    );
}
