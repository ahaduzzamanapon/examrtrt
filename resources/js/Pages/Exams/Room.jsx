import { useState, useEffect, useRef, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';

// ── Anti-cheat constants ────────────────────────────────────────────────────
const BLOCKED_KEYS = [
    'F12', 'F5',
    // Ctrl combos
    'ctrl+u', 'ctrl+s', 'ctrl+a', 'ctrl+c', 'ctrl+v', 'ctrl+p',
    'ctrl+shift+i', 'ctrl+shift+j', 'ctrl+shift+c',
];

// ── Exam Timer ──────────────────────────────────────────────────────────────
function ExamTimer({ endsAt, onExpire }) {
    const [remaining, setRemaining] = useState(0);

    useEffect(() => {
        const tick = () => {
            const diff = Math.max(0, Math.floor((new Date(endsAt) - Date.now()) / 1000));
            setRemaining(diff);
            if (diff === 0) onExpire();
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [endsAt, onExpire]);

    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    const isUrgent = remaining < 300; // last 5 minutes

    return (
        <div className={`flex items-center gap-1 font-mono font-bold text-lg ${isUrgent ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            ⏱ {h > 0 ? `${h}:` : ''}{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
        </div>
    );
}

// ── Warning Overlay ─────────────────────────────────────────────────────────
function WarningOverlay({ count, limit, onDismiss }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
             style={{ background: 'rgba(0,0,0,0.85)' }}>
            <div className="card glass max-w-sm w-full mx-4 p-6 text-center border border-red-500/40">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-white font-bold text-xl mb-2">সতর্কবার্তা!</h2>
                <p className="text-muted mb-4">
                    ট্যাব পরিবর্তন বা অন্য কোনো নকল-রোধ নিয়ম ভঙ্গ করা হয়েছে।<br />
                    <strong className="text-red-400">সতর্কতা: {count} / {limit}</strong>
                </p>
                {count >= limit ? (
                    <p className="text-red-400 font-bold">আপনাকে বাতিল করা হয়েছে!</p>
                ) : (
                    <button className="btn btn-primary" onClick={onDismiss}>
                        ঠিক আছে, বুঝেছি
                    </button>
                )}
            </div>
        </div>
    );
}

// ── Watermark ───────────────────────────────────────────────────────────────
function Watermark({ userName }) {
    return (
        <div className="fixed inset-0 pointer-events-none select-none z-30 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i}
                     className="absolute text-white/5 text-sm font-bold whitespace-nowrap"
                     style={{
                         top: `${10 + i * 12}%`,
                         left: `${(i % 3) * 30 - 10}%`,
                         transform: 'rotate(-25deg)',
                         fontSize: '11px',
                     }}>
                    {userName} • NXLY Exam Arena
                </div>
            ))}
        </div>
    );
}

// ── Question Palette ─────────────────────────────────────────────────────────
function QuestionPalette({ questions, currentIdx, answers, onJump }) {
    return (
        <div className="flex flex-wrap gap-1 justify-center">
            {questions.map((q, i) => {
                const answered = answers[q.id] !== undefined;
                const isCurrent = i === currentIdx;
                return (
                    <button
                        key={q.id}
                        onClick={() => onJump(i)}
                        className={`w-8 h-8 rounded text-xs font-bold transition-all ${
                            isCurrent
                                ? 'bg-violet-500 text-white ring-2 ring-violet-300'
                                : answered
                                ? 'bg-green-500/80 text-white'
                                : 'bg-white/10 text-muted'
                        }`}
                    >
                        {i + 1}
                    </button>
                );
            })}
        </div>
    );
}

// ── Main Exam Room ──────────────────────────────────────────────────────────
export default function ExamRoom({ auth, exam, questions = [], saved_answers = {}, warning_count = 0 }) {
    const [currentIdx, setCurrentIdx]     = useState(0);
    const [answers, setAnswers]           = useState(saved_answers);
    const [warnings, setWarnings]         = useState(warning_count);
    const [showWarning, setShowWarning]   = useState(false);
    const [disqualified, setDisqualified] = useState(false);
    const [submitting, setSubmitting]     = useState(false);
    const [startTime]                     = useState(Date.now());
    const saveTimer                       = useRef(null);
    const warnedRecently                  = useRef(false);

    const question = questions[currentIdx];

    // ── Save progress to server (debounced) ──────────────────────────────────
    const saveProgress = useCallback((ans) => {
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
            axios.post(route('exams.save-progress', exam.id), { answers: ans })
                .catch(() => {/* silent */});
        }, 2000);
    }, [exam.id]);

    // ── Select answer ─────────────────────────────────────────────────────────
    const selectAnswer = (qId, choice) => {
        const next = { ...answers, [qId]: choice };
        setAnswers(next);
        saveProgress(next);
    };

    // ── Submit exam ───────────────────────────────────────────────────────────
    const handleSubmit = () => {
        if (!confirm('পরীক্ষা জমা দিবেন? একবার দিলে পরিবর্তন করা যাবে না।')) return;
        setSubmitting(true);
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
        router.post(route('exams.submit', exam.id), { answers, time_taken_sec: timeTaken }, {
            onError: () => setSubmitting(false),
        });
    };

    // ── Timer expired = auto-submit ───────────────────────────────────────────
    const handleExpire = useCallback(() => {
        if (submitting) return;
        setSubmitting(true);
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
        router.post(route('exams.submit', exam.id), { answers, time_taken_sec: timeTaken });
    }, [answers, exam.id, startTime, submitting]);

    // ── Anti-cheat: tab visibility ───────────────────────────────────────────
    const triggerWarning = useCallback(() => {
        if (warnedRecently.current || disqualified) return;
        warnedRecently.current = true;
        setTimeout(() => { warnedRecently.current = false; }, 3000);

        axios.post(route('exams.warn', exam.id)).then(res => {
            const data = res.data;
            setWarnings(data.warning_count);
            if (data.disqualified) {
                setDisqualified(true);
                setShowWarning(true);
                setTimeout(() => router.visit(route('exams.result', exam.id)), 3000);
            } else {
                setShowWarning(true);
            }
        }).catch(() => {});
    }, [exam.id, disqualified]);

    useEffect(() => {
        const handleVisibility = () => {
            if (document.hidden) triggerWarning();
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [triggerWarning]);

    // ── Anti-cheat: keyboard blocking ────────────────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e) => {
            const combo = [
                e.ctrlKey && 'ctrl',
                e.shiftKey && 'shift',
                e.key,
            ].filter(Boolean).join('+').toLowerCase();

            if (BLOCKED_KEYS.includes(combo) || BLOCKED_KEYS.includes(e.key)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };
        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, []);

    // ── Anti-cheat: right-click ───────────────────────────────────────────────
    useEffect(() => {
        const prevent = (e) => e.preventDefault();
        document.addEventListener('contextmenu', prevent);
        return () => document.removeEventListener('contextmenu', prevent);
    }, []);

    // ── Anti-cheat: DevTools detection ────────────────────────────────────────
    useEffect(() => {
        const checkDevTools = () => {
            const threshold = 160;
            if (window.outerHeight - window.innerHeight > threshold ||
                window.outerWidth - window.innerWidth > threshold) {
                triggerWarning();
            }
        };
        const id = setInterval(checkDevTools, 2000);
        return () => clearInterval(id);
    }, [triggerWarning]);

    const answeredCount = Object.keys(answers).length;
    const totalQ = questions.length;

    return (
        <>
            <Head title={`পরীক্ষার হল — ${exam.title}`} />

            {/* Watermark */}
            <Watermark userName={auth?.user?.name || 'Student'} />

            {/* Warning overlay */}
            {showWarning && (
                <WarningOverlay
                    count={warnings}
                    limit={exam.anti_cheat_limit}
                    onDismiss={() => setShowWarning(false)}
                />
            )}

            {/* Fixed top bar */}
            <div className="fixed top-0 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between"
                 style={{ background: 'rgba(15,12,30,0.95)', borderBottom: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>
                <div className="flex-1">
                    <div className="text-white font-bold text-sm truncate max-w-[150px]">{exam.title}</div>
                    <div className="text-muted text-xs">{answeredCount}/{totalQ} উত্তর দেওয়া হয়েছে</div>
                </div>

                <ExamTimer endsAt={exam.ends_at} onExpire={handleExpire} />

                <div className="flex items-center gap-2 ml-3">
                    {warnings > 0 && (
                        <span className="text-yellow-400 text-xs font-bold">⚠️ {warnings}</span>
                    )}
                    <button
                        className="btn btn-primary text-xs px-3 py-1"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? '...' : 'জমা দিন'}
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="min-h-screen pt-16 pb-32 px-4" style={{ background: 'var(--bg-primary)' }}>

                {/* Question number + subject */}
                <div className="flex items-center justify-between mt-4 mb-3">
                    <span className="badge badge-info text-xs">{question?.subject}</span>
                    <span className="text-muted text-sm">{currentIdx + 1} / {totalQ}</span>
                </div>

                {/* Question text */}
                <div className="card glass p-4 mb-4">
                    <p className="text-white text-base leading-relaxed font-medium" style={{ fontFamily: 'Noto Serif Bengali, serif' }}>
                        {question?.question_text}
                    </p>
                </div>

                {/* Options */}
                <div className="space-y-3 mb-6">
                    {question && Object.entries(question.options || {}).map(([key, val]) => {
                        const selected = answers[question.id] === key;
                        return (
                            <button
                                key={key}
                                onClick={() => selectAnswer(question.id, key)}
                                className={`w-full text-left p-4 rounded-xl border transition-all ${
                                    selected
                                        ? 'border-violet-500 bg-violet-500/20 text-white'
                                        : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/30 hover:bg-white/10'
                                }`}
                            >
                                <span className={`inline-flex w-7 h-7 rounded-full items-center justify-center text-xs font-bold mr-3 ${
                                    selected ? 'bg-violet-500 text-white' : 'bg-white/10 text-gray-400'
                                }`}>
                                    {key.toUpperCase()}
                                </span>
                                <span style={{ fontFamily: 'Noto Serif Bengali, serif' }}>{val}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Navigation */}
                <div className="flex gap-3 mb-6">
                    <button
                        className="btn flex-1"
                        style={{ background: 'rgba(255,255,255,0.1)' }}
                        onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
                        disabled={currentIdx === 0}
                    >
                        ← আগের
                    </button>
                    <button
                        className="btn flex-1"
                        style={{ background: 'rgba(255,255,255,0.1)' }}
                        onClick={() => setCurrentIdx(i => Math.min(totalQ - 1, i + 1))}
                        disabled={currentIdx === totalQ - 1}
                    >
                        পরের →
                    </button>
                </div>

                {/* Question palette */}
                <div className="card glass p-4">
                    <div className="text-muted text-xs mb-3 text-center">প্রশ্নের প্যালেট</div>
                    <QuestionPalette
                        questions={questions}
                        currentIdx={currentIdx}
                        answers={answers}
                        onJump={setCurrentIdx}
                    />
                    <div className="flex gap-4 justify-center mt-3 text-xs text-muted">
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500" /> উত্তর দেওয়া</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-white/10" /> বাকি আছে</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-violet-500" /> বর্তমান</span>
                    </div>
                </div>

                {/* Negative marking warning */}
                {exam.negative_marking && (
                    <div className="mt-4 p-3 rounded-lg text-center"
                         style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <span className="text-red-400 text-xs">
                            ⚠️ নেগেটিভ মার্কিং: ভুল উত্তরে -{exam.negative_value} নম্বর কাটা যাবে
                        </span>
                    </div>
                )}
            </div>
        </>
    );
}
