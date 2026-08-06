import { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2, Bell, BellOff, ChevronRight } from 'lucide-react';

const GOALS = [
    { id: 'bcs',         emoji: '🏛️', label: 'BCS',         desc: 'বাংলাদেশ সিভিল সার্ভিস' },
    { id: 'hsc',         emoji: '📘', label: 'HSC',         desc: 'উচ্চমাধ্যমিক পরীক্ষা' },
    { id: 'ssc',         emoji: '📗', label: 'SSC',         desc: 'মাধ্যমিক পরীক্ষা' },
    { id: 'medical',     emoji: '⚕️', label: 'Medical',     desc: 'MBBS / BDS ভর্তি' },
    { id: 'engineering', emoji: '⚙️', label: 'Engineering', desc: 'BSc Engineering ভর্তি' },
    { id: 'bank',        emoji: '🏦', label: 'Bank Job',    desc: 'ব্যাংক নিয়োগ পরীক্ষা' },
    { id: 'university',  emoji: '🎓', label: 'University',  desc: 'বিশ্ববিদ্যালয় ভর্তি' },
    { id: 'primary',     emoji: '✏️', label: 'Primary',     desc: 'প্রাথমিক শিক্ষক নিয়োগ' },
    { id: 'other',       emoji: '📋', label: 'Other',       desc: 'অন্যান্য পরীক্ষা' },
];

// ── Firebase FCM token (using npm package, no CDN hang) ───────────────────────
async function requestFcmToken() {
    try {
        if (!('Notification' in window)) return null;
        if (!('serviceWorker' in navigator)) return null;

        // 8-second timeout to avoid infinite hang
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 8000)
        );

        const getTokenFlow = async () => {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') return null;

            const { initializeApp, getApps, getApp } = await import('firebase/app');
            const { getMessaging, getToken } = await import('firebase/messaging');

            const firebaseConfig = (() => {
                try { return JSON.parse(document.getElementById('firebase-config')?.textContent ?? '{}'); }
                catch { return {}; }
            })();

            const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
            const messaging = getMessaging(app);
            const swReg = await navigator.serviceWorker.register('/firebase-sw.js');

            const vapidKey = document.getElementById('vapid-key')?.textContent?.trim()
                ?? 'BKPEwvQSYwZhDuz0M3Bxodhf4Um980h5IvJJrIWcERJopbvV6JabGrSyk69lre_cOpqfRIAPsrhpMwVNvAjmWfc';

            return await getToken(messaging, { vapidKey, serviceWorkerRegistration: swReg });
        };

        return await Promise.race([getTokenFlow(), timeout]);
    } catch {
        return null;
    }
}

// ── Step dots ─────────────────────────────────────────────────────────────────
function StepDots({ step }) {
    return (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 28 }}>
            {[1, 2].map(s => (
                <div key={s} style={{
                    width: s === step ? 20 : 7, height: 7, borderRadius: 4,
                    background: s === step ? '#4d6fff' : 'rgba(255,255,255,0.15)',
                    transition: 'all 0.3s',
                }} />
            ))}
        </div>
    );
}

export default function Onboarding() {
    const { auth } = usePage().props;
    const [step, setStep]               = useState(1);
    const [goals, setGoals]             = useState([]); // multiple
    const [notifStatus, setNotifStatus] = useState('idle'); // idle|requesting|granted|denied
    const [saving, setSaving]           = useState(false);

    const csrf = document.querySelector('meta[name="csrf-token"]')?.content ?? '';

    const toggleGoal = (id) => {
        setGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
    };

    // ── Save goals + optional FCM token ───────────────────────────────────────
    const finish = async (skipNotif = false) => {
        setSaving(true);
        let fcmToken = null;

        if (!skipNotif) {
            setNotifStatus('requesting');
            fcmToken = await requestFcmToken();
            setNotifStatus(fcmToken ? 'granted' : 'denied');
            await new Promise(r => setTimeout(r, 600));
        }

        await fetch(route('onboarding.save'), {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf, 'Accept': 'application/json' },
            body:    JSON.stringify({ exam_goals: goals, fcm_token: fcmToken }),
        });

        window.location.href = route('dashboard');
    };

    return (
        <>
            <Head title="শুরু করো — Exam Arena" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&family=Inter:wght@400;600;700;800&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg,#05071a 0%,#0a0e23 50%,#0f1730 100%)',
                fontFamily: "'Hind Siliguri','Inter',sans-serif",
                padding: '24px 16px',
            }}>
                <div style={{ position: 'fixed', top: '20%', left: '30%', width: 500, height: 500, background: 'radial-gradient(circle,rgba(77,111,255,0.12) 0%,transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
                <div style={{ position: 'fixed', bottom: '10%', right: '20%', width: 300, height: 300, background: 'radial-gradient(circle,rgba(124,58,237,0.1) 0%,transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

                <div style={{ width: '100%', maxWidth: 560, position: 'relative', zIndex: 1 }}>

                    {/* Logo */}
                    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                        <img src="/logo.png" alt="Exam Arena" style={{ height: 40, objectFit: 'contain' }} />
                    </motion.div>

                    <StepDots step={step} />

                    <AnimatePresence mode="wait">

                        {/* ── STEP 1: Select goals (multiple) ──────────────── */}
                        {step === 1 && (
                            <motion.div key="step1"
                                initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>

                                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                    <h1 style={{ color: 'white', fontWeight: 900, fontSize: 22, lineHeight: 1.3 }}>
                                        স্বাগতম, {auth?.user?.name?.split(' ')[0] ?? 'বন্ধু'}! 👋
                                    </h1>
                                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 8 }}>
                                        তুমি কোন কোন পরীক্ষার প্রস্তুতি নিচ্ছো? <span style={{ color: '#4d6fff' }}>(একাধিক বেছে নিতে পারবে)</span>
                                    </p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
                                    {GOALS.map((g, i) => {
                                        const selected = goals.includes(g.id);
                                        return (
                                            <motion.button key={g.id} type="button"
                                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: i * 0.04 }} whileTap={{ scale: 0.94 }}
                                                onClick={() => toggleGoal(g.id)}
                                                style={{
                                                    padding: '12px 8px', borderRadius: 14,
                                                    background: selected ? 'rgba(77,111,255,0.22)' : 'rgba(255,255,255,0.04)',
                                                    border: `2px solid ${selected ? '#4d6fff' : 'rgba(255,255,255,0.08)'}`,
                                                    cursor: 'pointer', textAlign: 'center',
                                                    transition: 'all 0.15s', position: 'relative',
                                                }}>
                                                {selected && (
                                                    <div style={{ position: 'absolute', top: 5, right: 5 }}>
                                                        <CheckCircle size={13} style={{ color: '#4d6fff' }} />
                                                    </div>
                                                )}
                                                <div style={{ fontSize: 20, marginBottom: 4 }}>{g.emoji}</div>
                                                <div style={{ color: selected ? '#93b4ff' : 'white', fontWeight: 700, fontSize: 11 }}>{g.label}</div>
                                                <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 9, marginTop: 1, lineHeight: 1.3 }}>{g.desc}</div>
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Selected count badge */}
                                {goals.length > 0 && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        style={{ textAlign: 'center', marginBottom: 10, color: '#93b4ff', fontSize: 13 }}>
                                        ✅ {goals.length}টি পরীক্ষা বেছে নেওয়া হয়েছে
                                    </motion.div>
                                )}

                                <motion.button type="button" whileTap={{ scale: 0.98 }}
                                    disabled={goals.length === 0}
                                    onClick={() => setStep(2)}
                                    style={{
                                        width: '100%', padding: '13px', borderRadius: 14, border: 'none',
                                        background: goals.length > 0 ? 'linear-gradient(135deg,#4d6fff,#7c3aed)' : 'rgba(77,111,255,0.2)',
                                        color: 'white', fontWeight: 700, fontSize: 15,
                                        cursor: goals.length > 0 ? 'pointer' : 'not-allowed',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        boxShadow: goals.length > 0 ? '0 6px 24px rgba(77,111,255,0.4)' : 'none',
                                        transition: 'all 0.2s',
                                    }}>
                                    পরবর্তী <ChevronRight size={16} />
                                </motion.button>
                            </motion.div>
                        )}

                        {/* ── STEP 2: Notification permission ──────────────── */}
                        {step === 2 && (
                            <motion.div key="step2"
                                initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>

                                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                        style={{ width: 68, height: 68, borderRadius: 20, background: 'linear-gradient(135deg,#4d6fff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 12px 32px rgba(77,111,255,0.4)' }}>
                                        {notifStatus === 'granted'
                                            ? <CheckCircle size={30} color="white" />
                                            : notifStatus === 'denied'
                                            ? <BellOff size={30} color="white" />
                                            : <Bell size={30} color="white" fill="rgba(255,255,255,0.3)" />
                                        }
                                    </motion.div>
                                    <h2 style={{ color: 'white', fontWeight: 900, fontSize: 20 }}>Notification চালু করো</h2>
                                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 8, lineHeight: 1.7 }}>
                                        নতুন কনটেস্ট, ফলাফল এবং বিশেষ অফার সম্পর্কে সাথে সাথে জানো।
                                    </p>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 20 }}>
                                    {[
                                        '🔔 Live Contest শুরু হওয়ার আগেই সতর্কতা পাবে',
                                        '🏆 পরীক্ষার ফলাফল সাথে সাথে জানতে পারবে',
                                        '🎁 Special Offer এবং Token Bonus এর আপডেট',
                                    ].map(item => (
                                        <div key={item} style={{
                                            padding: '10px 14px', borderRadius: 12,
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.07)',
                                            color: 'rgba(255,255,255,0.7)', fontSize: 13,
                                        }}>
                                            {item}
                                        </div>
                                    ))}
                                </div>

                                {notifStatus === 'granted' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        style={{ padding: '10px', borderRadius: 12, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', fontSize: 13, textAlign: 'center', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                                        <CheckCircle size={15} /> Notification চালু হয়েছে! 🎉
                                    </motion.div>
                                )}

                                <motion.button type="button" whileTap={{ scale: 0.98 }}
                                    disabled={saving}
                                    onClick={() => finish(false)}
                                    style={{
                                        width: '100%', padding: '13px', borderRadius: 14, border: 'none',
                                        background: 'linear-gradient(135deg,#4d6fff,#7c3aed)',
                                        color: 'white', fontWeight: 700, fontSize: 15,
                                        cursor: saving ? 'wait' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        boxShadow: '0 6px 24px rgba(77,111,255,0.4)', marginBottom: 10,
                                    }}>
                                    {saving
                                        ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> {notifStatus === 'requesting' ? 'Permission চাওয়া হচ্ছে...' : 'শুরু হচ্ছে...'}</>
                                        : <><Bell size={16} /> Notification চালু করো</>
                                    }
                                </motion.button>

                                <button type="button" onClick={() => finish(true)} disabled={saving}
                                    style={{ width: '100%', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 13, cursor: 'pointer', padding: '8px' }}>
                                    এখনই নয়, Skip করো
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </>
    );
}
