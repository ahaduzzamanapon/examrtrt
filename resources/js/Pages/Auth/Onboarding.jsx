import { useState, useRef } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2, Bell, BellOff, ChevronRight, Camera, Upload, User } from 'lucide-react';

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

// ── Firebase FCM (npm, 8s timeout) ────────────────────────────────────────────
async function requestFcmToken() {
    try {
        if (!('Notification' in window) || !('serviceWorker' in navigator)) return null;
        const timeout = new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 8000));
        const flow = async () => {
            const perm = await Notification.requestPermission();
            if (perm !== 'granted') return null;
            const { initializeApp, getApps, getApp } = await import('firebase/app');
            const { getMessaging, getToken } = await import('firebase/messaging');
            let cfg = {};
            try { cfg = JSON.parse(document.getElementById('firebase-config')?.textContent ?? '{}'); } catch {}
            const app = getApps().length ? getApp() : initializeApp(cfg);
            const msg = getMessaging(app);
            const sw  = await navigator.serviceWorker.register('/firebase-sw.js');
            const vapidKey = document.getElementById('vapid-key')?.textContent?.trim()
                ?? 'BKPEwvQSYwZhDuz0M3Bxodhf4Um980h5IvJJrIWcERJopbvV6JabGrSyk69lre_cOpqfRIAPsrhpMwVNvAjmWfc';
            return await getToken(msg, { vapidKey, serviceWorkerRegistration: sw });
        };
        return await Promise.race([flow(), timeout]);
    } catch { return null; }
}

// ── Step dots ─────────────────────────────────────────────────────────────────
function StepDots({ step, total = 3 }) {
    return (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
            {Array.from({ length: total }, (_, i) => i + 1).map(s => (
                <div key={s} style={{
                    width: s === step ? 22 : 7, height: 7, borderRadius: 4,
                    background: s === step ? '#4d6fff' : s < step ? 'rgba(77,111,255,0.5)' : 'rgba(255,255,255,0.15)',
                    transition: 'all 0.3s',
                }} />
            ))}
        </div>
    );
}

export default function Onboarding() {
    const { auth } = usePage().props;
    const [step, setStep]               = useState(1);
    const [goals, setGoals]             = useState([]);
    const [notifStatus, setNotifStatus] = useState('idle');
    const [saving, setSaving]           = useState(false);
    const [fcmToken, setFcmToken]       = useState(null);

    // Avatar state
    const [avatarFile, setAvatarFile]     = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [uploading, setUploading]       = useState(false);
    const fileInputRef = useRef(null);

    const csrf = document.querySelector('meta[name="csrf-token"]')?.content ?? '';

    const toggleGoal = (id) =>
        setGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);

    // ── Step 2: request notification ──────────────────────────────────────────
    const handleNotif = async (skip = false) => {
        setSaving(true);
        let token = null;
        if (!skip) {
            setNotifStatus('requesting');
            token = await requestFcmToken();
            setNotifToken(token);
            setNotifStatus(token ? 'granted' : 'denied');
            await new Promise(r => setTimeout(r, 600));
        }
        setFcmToken(token);
        setSaving(false);
        setStep(3);
    };

    // helper to fix ref above
    const setNotifToken = (t) => {};

    // ── Step 3: pick avatar file ───────────────────────────────────────────────
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    // ── Final save: goals + fcm + avatar ──────────────────────────────────────
    const finish = async (skipAvatar = false) => {
        setUploading(true);

        // 1. Save goals + fcm_token
        await fetch(route('onboarding.save'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf, 'Accept': 'application/json' },
            body: JSON.stringify({ exam_goals: goals, fcm_token: fcmToken }),
        });

        // 2. Upload avatar if chosen
        if (!skipAvatar && avatarFile) {
            const fd = new FormData();
            fd.append('avatar', avatarFile);
            fd.append('_token', csrf);
            await fetch(route('profile.avatar'), { method: 'POST', body: fd })
                .catch(() => {});
        }

        window.location.href = route('dashboard');
    };

    // ── Shared card style ─────────────────────────────────────────────────────
    const card = {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20, padding: '24px',
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
                minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                background: 'linear-gradient(135deg,#05071a 0%,#0a0e23 50%,#0f1730 100%)',
                fontFamily: "'Hind Siliguri','Inter',sans-serif",
                padding: '24px 16px 40px',
            }}>
                <div style={{ position: 'fixed', top: '15%', left: '25%', width: 500, height: 500, background: 'radial-gradient(circle,rgba(77,111,255,0.1) 0%,transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

                <div style={{ width: '100%', maxWidth: 520, position: 'relative', zIndex: 1 }}>
                    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                        <img src="/logo.png" alt="Exam Arena" style={{ height: 38, objectFit: 'contain' }} />
                    </motion.div>

                    <StepDots step={step} total={3} />

                    <AnimatePresence mode="wait">

                        {/* ── STEP 1: Select goals ──────────────────────────── */}
                        {step === 1 && (
                            <motion.div key="step1"
                                initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                                <div style={card}>
                                    <div style={{ textAlign: 'center', marginBottom: 18 }}>
                                        <h1 style={{ color: 'white', fontWeight: 900, fontSize: 20, lineHeight: 1.3 }}>
                                            স্বাগতম, {auth?.user?.name?.split(' ')[0] ?? 'বন্ধু'}! 👋
                                        </h1>
                                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 6 }}>
                                            কোন কোন পরীক্ষার প্রস্তুতি নিচ্ছো? <span style={{ color: '#4d6fff' }}>(একাধিক বেছে নাও)</span>
                                        </p>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7, marginBottom: 14 }}>
                                        {GOALS.map((g, i) => {
                                            const sel = goals.includes(g.id);
                                            return (
                                                <motion.button key={g.id} type="button"
                                                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: i * 0.03 }} whileTap={{ scale: 0.93 }}
                                                    onClick={() => toggleGoal(g.id)}
                                                    style={{
                                                        padding: '11px 6px', borderRadius: 13,
                                                        background: sel ? 'rgba(77,111,255,0.22)' : 'rgba(255,255,255,0.04)',
                                                        border: `2px solid ${sel ? '#4d6fff' : 'rgba(255,255,255,0.08)'}`,
                                                        cursor: 'pointer', textAlign: 'center', position: 'relative',
                                                        transition: 'all 0.15s',
                                                    }}>
                                                    {sel && <div style={{ position: 'absolute', top: 4, right: 4 }}><CheckCircle size={11} style={{ color: '#4d6fff' }} /></div>}
                                                    <div style={{ fontSize: 18, marginBottom: 3 }}>{g.emoji}</div>
                                                    <div style={{ color: sel ? '#93b4ff' : 'white', fontWeight: 700, fontSize: 10 }}>{g.label}</div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>

                                    {goals.length > 0 && (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            style={{ textAlign: 'center', color: '#93b4ff', fontSize: 12, marginBottom: 10 }}>
                                            ✅ {goals.length}টি পরীক্ষা বেছে নেওয়া হয়েছে
                                        </motion.p>
                                    )}

                                    <motion.button type="button" whileTap={{ scale: 0.98 }}
                                        disabled={goals.length === 0} onClick={() => setStep(2)}
                                        style={{
                                            width: '100%', padding: '12px', borderRadius: 13, border: 'none',
                                            background: goals.length > 0 ? 'linear-gradient(135deg,#4d6fff,#7c3aed)' : 'rgba(77,111,255,0.2)',
                                            color: 'white', fontWeight: 700, fontSize: 14,
                                            cursor: goals.length > 0 ? 'pointer' : 'not-allowed',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                                            boxShadow: goals.length > 0 ? '0 6px 20px rgba(77,111,255,0.35)' : 'none',
                                        }}>
                                        পরবর্তী <ChevronRight size={15} />
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 2: Notification ─────────────────────────── */}
                        {step === 2 && (
                            <motion.div key="step2"
                                initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                                <div style={card}>
                                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                            transition={{ type: 'spring', stiffness: 300 }}
                                            style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg,#4d6fff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 10px 28px rgba(77,111,255,0.4)' }}>
                                            {notifStatus === 'granted' ? <CheckCircle size={28} color="white" />
                                                : notifStatus === 'denied' ? <BellOff size={28} color="white" />
                                                : <Bell size={28} color="white" fill="rgba(255,255,255,0.3)" />}
                                        </motion.div>
                                        <h2 style={{ color: 'white', fontWeight: 900, fontSize: 19 }}>Notification চালু করো</h2>
                                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 7, lineHeight: 1.7 }}>
                                            নতুন কনটেস্ট, ফলাফল এবং বিশেষ অফার সম্পর্কে সাথে সাথে জানো।
                                        </p>
                                    </div>

                                    {['🔔 Live Contest শুরু হওয়ার আগেই সতর্কতা', '🏆 পরীক্ষার ফলাফল সাথে সাথে', '🎁 Special Offer ও Token Bonus'].map(t => (
                                        <div key={t} style={{ padding: '9px 13px', borderRadius: 11, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.65)', fontSize: 12, marginBottom: 6 }}>{t}</div>
                                    ))}

                                    <motion.button type="button" whileTap={{ scale: 0.98 }}
                                        disabled={saving} onClick={() => handleNotif(false)}
                                        style={{ width: '100%', padding: '12px', borderRadius: 13, border: 'none', background: 'linear-gradient(135deg,#4d6fff,#7c3aed)', color: 'white', fontWeight: 700, fontSize: 14, cursor: saving ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, boxShadow: '0 6px 20px rgba(77,111,255,0.35)', marginTop: 14, marginBottom: 8 }}>
                                        {saving ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> {notifStatus === 'requesting' ? 'Permission চাওয়া হচ্ছে...' : 'অপেক্ষা করো...'}</> : <><Bell size={15} /> Notification চালু করো</>}
                                    </motion.button>

                                    <button type="button" onClick={() => handleNotif(true)} disabled={saving}
                                        style={{ width: '100%', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 12, cursor: 'pointer', padding: '7px' }}>
                                        এখনই নয়, পরে করবো
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 3: Profile Photo ─────────────────────────── */}
                        {step === 3 && (
                            <motion.div key="step3"
                                initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                                <div style={card}>
                                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                        <h2 style={{ color: 'white', fontWeight: 900, fontSize: 19 }}>প্রোফাইল ছবি দাও 📸</h2>
                                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 6 }}>
                                            তোমার ছবি দিলে অন্যরা তোমাকে চিনতে পারবে।
                                        </p>
                                    </div>

                                    {/* Avatar preview */}
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                                        <div style={{ position: 'relative' }}>
                                            <div style={{
                                                width: 110, height: 110, borderRadius: '50%',
                                                background: 'linear-gradient(135deg,#4d6fff,#7c3aed)',
                                                border: '3px solid rgba(77,111,255,0.4)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                overflow: 'hidden',
                                            }}>
                                                {avatarPreview
                                                    ? <img src={avatarPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    : <User size={44} color="rgba(255,255,255,0.4)" />
                                                }
                                            </div>
                                            {/* Camera button */}
                                            <motion.button whileTap={{ scale: 0.9 }} type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                style={{
                                                    position: 'absolute', bottom: 4, right: 4,
                                                    width: 32, height: 32, borderRadius: '50%',
                                                    background: 'linear-gradient(135deg,#4d6fff,#7c3aed)',
                                                    border: '2px solid #0a0e23',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    cursor: 'pointer',
                                                }}>
                                                <Camera size={14} color="white" />
                                            </motion.button>
                                        </div>
                                    </div>

                                    {/* Hidden file input */}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        capture="user"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />

                                    {/* Upload buttons */}
                                    <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                                        <motion.button whileTap={{ scale: 0.96 }} type="button"
                                            onClick={() => { fileInputRef.current.removeAttribute('capture'); fileInputRef.current?.click(); }}
                                            style={{ flex: 1, padding: '10px', borderRadius: 12, border: '1.5px solid rgba(77,111,255,0.3)', background: 'rgba(77,111,255,0.1)', color: '#93b4ff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                            <Upload size={14} /> গ্যালারি
                                        </motion.button>
                                        <motion.button whileTap={{ scale: 0.96 }} type="button"
                                            onClick={() => { fileInputRef.current.setAttribute('capture', 'user'); fileInputRef.current?.click(); }}
                                            style={{ flex: 1, padding: '10px', borderRadius: 12, border: '1.5px solid rgba(77,111,255,0.3)', background: 'rgba(77,111,255,0.1)', color: '#93b4ff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                            <Camera size={14} /> ক্যামেরা
                                        </motion.button>
                                    </div>

                                    <motion.button type="button" whileTap={{ scale: 0.98 }}
                                        disabled={uploading} onClick={() => finish(false)}
                                        style={{
                                            width: '100%', padding: '12px', borderRadius: 13, border: 'none',
                                            background: 'linear-gradient(135deg,#4d6fff,#7c3aed)',
                                            color: 'white', fontWeight: 700, fontSize: 14,
                                            cursor: uploading ? 'wait' : 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                                            boxShadow: '0 6px 20px rgba(77,111,255,0.35)', marginBottom: 8,
                                        }}>
                                        {uploading
                                            ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> সেভ হচ্ছে...</>
                                            : avatarFile ? '✅ সেভ করো এবং শুরু করো' : '🚀 শুরু করো'}
                                    </motion.button>

                                    <button type="button" onClick={() => finish(true)} disabled={uploading}
                                        style={{ width: '100%', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 12, cursor: 'pointer', padding: '7px' }}>
                                        ছবি ছাড়াই এগিয়ে যাও
                                    </button>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </>
    );
}
