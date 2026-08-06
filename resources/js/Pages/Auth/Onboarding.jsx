import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2, Bell, BellOff, ChevronRight } from 'lucide-react';

const GOALS = [
    { id: 'ssc',         emoji: '📗', label: 'SSC',         desc: 'মাধ্যমিক পরীক্ষা' },
    { id: 'hsc',         emoji: '📘', label: 'HSC',         desc: 'উচ্চমাধ্যমিক পরীক্ষা' },
    { id: 'bcs',         emoji: '🏛️', label: 'BCS',         desc: 'বাংলাদেশ সিভিল সার্ভিস' },
    { id: 'medical',     emoji: '⚕️', label: 'Medical',     desc: 'MBBS / BDS ভর্তি' },
    { id: 'engineering', emoji: '⚙️', label: 'Engineering', desc: 'BSc Engineering ভর্তি' },
    { id: 'bank',        emoji: '🏦', label: 'Bank Job',    desc: 'ব্যাংক নিয়োগ পরীক্ষা' },
    { id: 'university',  emoji: '🎓', label: 'University',  desc: 'বিশ্ববিদ্যালয় ভর্তি' },
    { id: 'primary',     emoji: '✏️', label: 'Primary',     desc: 'প্রাথমিক শিক্ষক নিয়োগ' },
    { id: 'other',       emoji: '📋', label: 'Other',       desc: 'অন্যান্য পরীক্ষা' },
];

// ── Firebase helper ───────────────────────────────────────────────────────────
async function requestFcmToken() {
    try {
        if (!('Notification' in window)) return null;
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return null;

        const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getMessaging, getToken } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js');

        const firebaseConfig = JSON.parse(document.getElementById('firebase-config')?.textContent ?? '{}');
        const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
        const messaging = getMessaging(app);

        const token = await getToken(messaging, {
            vapidKey: document.getElementById('vapid-key')?.textContent?.trim(),
            serviceWorkerRegistration: await navigator.serviceWorker.ready,
        });
        return token;
    } catch {
        return null;
    }
}

// ── Step indicator ────────────────────────────────────────────────────────────
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
    const [step, setStep] = useState(1);
    const [goal, setGoal] = useState('');
    const [notifStatus, setNotifStatus] = useState('idle'); // idle | requesting | granted | denied
    const [saving, setSaving] = useState(false);

    const csrf = document.querySelector('meta[name="csrf-token"]')?.content ?? '';

    // ── Save goal + (optional) FCM token and redirect ─────────────────────────
    const finish = async (skipNotif = false) => {
        setSaving(true);
        let fcmToken = null;

        if (!skipNotif) {
            setNotifStatus('requesting');
            fcmToken = await requestFcmToken();
            setNotifStatus(fcmToken ? 'granted' : 'denied');
            await new Promise(r => setTimeout(r, 800)); // brief feedback
        }

        // Save via fetch (simple POST)
        await fetch(route('onboarding.save'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf, 'Accept': 'application/json' },
            body: JSON.stringify({ exam_goal: goal, fcm_token: fcmToken }),
        });

        window.location.href = route('dashboard');
    };

    const enableNotifications = () => finish(false);
    const skipNotifications   = () => finish(true);

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
                padding: '24px 16px', overflow: 'hidden',
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

                        {/* ── STEP 1: Select goal ─────────────────────────── */}
                        {step === 1 && (
                            <motion.div key="step1"
                                initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>

                                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                    <h1 style={{ color: 'white', fontWeight: 900, fontSize: 24, lineHeight: 1.3 }}>
                                        স্বাগতম, {auth?.user?.name?.split(' ')[0] ?? 'বন্ধু'}! 👋
                                    </h1>
                                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginTop: 8 }}>
                                        তুমি কোন পরীক্ষার প্রস্তুতি নিচ্ছো?
                                    </p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
                                    {GOALS.map((g, i) => {
                                        const selected = goal === g.id;
                                        return (
                                            <motion.button key={g.id} type="button"
                                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: i * 0.04 }} whileTap={{ scale: 0.95 }}
                                                onClick={() => setGoal(g.id)}
                                                style={{
                                                    padding: '14px 8px', borderRadius: 14,
                                                    background: selected ? 'rgba(77,111,255,0.2)' : 'rgba(255,255,255,0.04)',
                                                    border: `2px solid ${selected ? '#4d6fff' : 'rgba(255,255,255,0.08)'}`,
                                                    cursor: 'pointer', textAlign: 'center',
                                                    transition: 'all 0.15s', position: 'relative',
                                                }}>
                                                {selected && <div style={{ position: 'absolute', top: 6, right: 6 }}><CheckCircle size={13} style={{ color: '#4d6fff' }} /></div>}
                                                <div style={{ fontSize: 22, marginBottom: 5 }}>{g.emoji}</div>
                                                <div style={{ color: selected ? '#93b4ff' : 'white', fontWeight: 700, fontSize: 12 }}>{g.label}</div>
                                                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, marginTop: 2, lineHeight: 1.3 }}>{g.desc}</div>
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                <motion.button type="button" whileTap={{ scale: 0.98 }}
                                    disabled={!goal}
                                    onClick={() => setStep(2)}
                                    style={{
                                        width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                                        background: goal ? 'linear-gradient(135deg,#4d6fff,#7c3aed)' : 'rgba(77,111,255,0.2)',
                                        color: 'white', fontWeight: 700, fontSize: 15,
                                        cursor: goal ? 'pointer' : 'not-allowed',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        boxShadow: goal ? '0 6px 24px rgba(77,111,255,0.4)' : 'none',
                                        transition: 'all 0.2s',
                                    }}>
                                    পরবর্তী <ChevronRight size={16} />
                                </motion.button>
                            </motion.div>
                        )}

                        {/* ── STEP 2: Notification permission ─────────────── */}
                        {step === 2 && (
                            <motion.div key="step2"
                                initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>

                                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                                    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300 }}
                                        style={{ width: 72, height: 72, borderRadius: 22, background: 'linear-gradient(135deg,#4d6fff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 12px 32px rgba(77,111,255,0.4)' }}>
                                        {notifStatus === 'granted'
                                            ? <CheckCircle size={34} color="white" />
                                            : notifStatus === 'denied'
                                            ? <BellOff size={34} color="white" />
                                            : <Bell size={34} color="white" fill="rgba(255,255,255,0.3)" />
                                        }
                                    </motion.div>
                                    <h2 style={{ color: 'white', fontWeight: 900, fontSize: 22 }}>Notification চালু করো</h2>
                                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginTop: 10, lineHeight: 1.7 }}>
                                        নতুন কনটেস্ট, পরীক্ষার ফলাফল এবং বিশেষ অফার সম্পর্কে সাথে সাথে জানতে notification চালু করো।
                                    </p>
                                </div>

                                {/* Benefits */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                                    {[
                                        '🔔 Live Contest শুরু হওয়ার আগেই সতর্কতা পাবে',
                                        '🏆 পরীক্ষার ফলাফল সাথে সাথে জানতে পারবে',
                                        '🎁 Special Offer এবং Token Bonus এর আপডেট',
                                    ].map(item => (
                                        <div key={item} style={{
                                            padding: '11px 14px', borderRadius: 12,
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.07)',
                                            color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.4,
                                        }}>
                                            {item}
                                        </div>
                                    ))}
                                </div>

                                {notifStatus === 'granted' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        style={{ padding: '12px', borderRadius: 12, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', fontSize: 14, textAlign: 'center', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                        <CheckCircle size={16} /> Notification চালু হয়েছে! 🎉
                                    </motion.div>
                                )}

                                <motion.button type="button" whileTap={{ scale: 0.98 }}
                                    disabled={saving}
                                    onClick={enableNotifications}
                                    style={{
                                        width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                                        background: 'linear-gradient(135deg,#4d6fff,#7c3aed)',
                                        color: 'white', fontWeight: 700, fontSize: 15,
                                        cursor: saving ? 'wait' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        boxShadow: '0 6px 24px rgba(77,111,255,0.4)', marginBottom: 10,
                                        transition: 'all 0.2s',
                                    }}>
                                    {saving
                                        ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> শুরু হচ্ছে...</>
                                        : notifStatus === 'requesting'
                                        ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Permission চাওয়া হচ্ছে...</>
                                        : <><Bell size={16} /> Notification চালু করো</>
                                    }
                                </motion.button>

                                <button type="button" onClick={skipNotifications} disabled={saving}
                                    style={{ width: '100%', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 13, cursor: 'pointer', padding: '8px', marginTop: 2 }}>
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
