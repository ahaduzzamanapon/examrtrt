import { useState, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
    User, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft,
    CheckCircle, Bell, BellOff, Loader2, RefreshCw, Zap, Star, Shield, Gift,
} from 'lucide-react';

const GOALS = [
    { id: 'ssc',         emoji: '📗', label: 'SSC',         desc: 'মাধ্যমিক' },
    { id: 'hsc',         emoji: '📘', label: 'HSC',         desc: 'উচ্চ মাধ্যমিক' },
    { id: 'bcs',         emoji: '🏛️', label: 'BCS',         desc: 'সিভিল সার্ভিস' },
    { id: 'medical',     emoji: '⚕️', label: 'Medical',     desc: 'MBBS ভর্তি' },
    { id: 'engineering', emoji: '⚙️', label: 'Engineering', desc: 'বুয়েট ভর্তি' },
    { id: 'bank',        emoji: '🏦', label: 'Bank Job',    desc: 'ব্যাংক নিয়োগ' },
    { id: 'university',  emoji: '🎓', label: 'University',  desc: 'ভার্সিটি ভর্তি' },
    { id: 'primary',     emoji: '✏️', label: 'Primary',     desc: 'প্রাথমিক শিক্ষক' },
    { id: 'ntrca',       emoji: '📜', label: 'NTRCA',       desc: 'শিক্ষক নিবন্ধন' },
    { id: 'other',       emoji: '📋', label: 'Other',       desc: 'অন্যান্য' },
];

const STEPS = ['একাউন্ট', 'যাচাই', 'লক্ষ্য', 'শেষ!'];

const LEFT_FEATURES = [
    { emoji: '🎁', title: '৫০ বোনাস টোকেন', desc: 'নিবন্ধনের সাথে সাথেই পাবে' },
    { emoji: '⚡', title: 'লাইভ কনটেস্ট', desc: 'শত প্রতিযোগীর সাথে পরীক্ষা' },
    { emoji: '🏆', title: 'লিডারবোর্ড র‍্যাংক', desc: 'শীর্ষে উঠে পুরস্কার জিতো' },
    { emoji: '🤖', title: 'AI প্র্যাকটিস', desc: 'BCS, HSC, SSC সব বিষয়ে' },
];

// Animation
const slideVar = {
    enter: d => ({ x: d * 40, opacity: 0, scale: 0.98 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: d => ({ x: -d * 40, opacity: 0, scale: 0.98 }),
};
const slideTrans = { type: 'spring', stiffness: 400, damping: 42 };

// Input field
function Field({ icon: Icon, label, type = 'text', value, onChange, placeholder, right }) {
    const [f, setF] = useState(false);
    return (
        <div style={{ marginBottom: 10 }}>
            <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>{label}</label>
            <div style={{ position: 'relative' }}>
                <Icon size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: f ? '#7c94ff' : 'rgba(255,255,255,0.3)', transition: 'color 0.2s' }} />
                <input
                    type={type} value={value} placeholder={placeholder}
                    onChange={e => onChange(e.target.value)}
                    onFocus={() => setF(true)} onBlur={() => setF(false)}
                    style={{
                        width: '100%', boxSizing: 'border-box',
                        padding: `12px 12px 12px ${right ? '36px' : '36px'}`,
                        paddingRight: right ? 40 : 12,
                        background: 'rgba(255,255,255,0.06)',
                        border: `1.5px solid ${f ? '#4d6fff' : 'rgba(255,255,255,0.12)'}`,
                        borderRadius: 12, color: 'white', fontSize: 14, outline: 'none',
                        transition: 'border-color 0.2s',
                    }}
                />
                {right && <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>{right}</div>}
            </div>
        </div>
    );
}

function Btn({ onClick, loading, disabled, children, secondary }) {
    return (
        <button onClick={onClick} disabled={loading || disabled} style={{
            width: '100%', padding: '12px', borderRadius: 12, border: secondary ? '1px solid rgba(255,255,255,0.1)' : 'none',
            background: secondary ? 'rgba(255,255,255,0.05)' : (loading || disabled) ? 'rgba(77,111,255,0.3)' : 'linear-gradient(135deg,#4d6fff,#7c3aed)',
            color: secondary ? 'rgba(255,255,255,0.45)' : 'white', fontWeight: secondary ? 500 : 700, fontSize: 14,
            cursor: (loading || disabled) ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            marginBottom: 8, transition: 'all 0.2s',
            boxShadow: (!secondary && !loading && !disabled) ? '0 4px 18px rgba(77,111,255,0.3)' : 'none',
        }}>
            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : children}
        </button>
    );
}

function Err({ msg }) {
    if (!msg) return null;
    return (
        <div style={{ color: '#f87171', fontSize: 12, textAlign: 'center', padding: '7px 10px', background: 'rgba(248,113,113,0.1)', borderRadius: 9, marginBottom: 10 }}>
            {msg}
        </div>
    );
}

export default function Register() {
    const [step, setStep] = useState(0);
    const [dir, setDir] = useState(1);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPass] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const [goal, setGoal] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');
    const otpRefs = useRef([]);

    const next = () => { setDir(1); setStep(s => s + 1); setErr(''); };
    const back = () => { setDir(-1); setStep(s => s - 1); setErr(''); };

    const sendOtp = async () => {
        if (!name.trim()) return setErr('নাম লিখুন।');
        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return setErr('সঠিক ইমেইল দিন।');
        if (password.length < 8) return setErr('পাসওয়ার্ড কমপক্ষে ৮ অক্ষর।');
        setLoading(true); setErr('');
        try {
            await axios.post('/auth/send-otp', { name, email });
            next();
        } catch (e) { setErr(e.response?.data?.message ?? 'ইমেইল পাঠানো সম্ভব হয়নি।'); }
        finally { setLoading(false); }
    };

    const verifyOtp = async () => {
        const code = digits.join('');
        if (code.length < 6) return setErr('৬ সংখ্যার কোড দিন।');
        setLoading(true); setErr('');
        try {
            await axios.post('/auth/verify-otp', { email, otp: code });
            next();
        } catch (e) {
            setErr(e.response?.data?.message ?? 'ভুল কোড।');
            setDigits(['', '', '', '', '', '']);
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        } finally { setLoading(false); }
    };

    const resendOtp = async () => {
        setLoading(true); setErr('');
        try {
            await axios.post('/auth/send-otp', { name, email });
            setDigits(['', '', '', '', '', '']);
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        } catch (e) { setErr('পুনরায় পাঠানো যায়নি।'); }
        finally { setLoading(false); }
    };

    const confirmGoal = () => { if (!goal) return setErr('একটি লক্ষ্য বেছে নিন।'); next(); };

    const finish = async (withNotif) => {
        if (withNotif && 'Notification' in window) await Notification.requestPermission().catch(() => {});
        setLoading(true); setErr('');

        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const refParam  = urlParams ? (urlParams.get('ref') || urlParams.get('referral_code') || '') : '';

        router.post('/register', {
            name, email, password,
            password_confirmation: password,
            exam_goal: goal,
            ref: refParam,
        }, {
            onError: errs => { setErr(Object.values(errs)[0] ?? 'নিবন্ধন ব্যর্থ।'); setLoading(false); },
        });
    };

    const onDigit = (i, val) => {
        if (!/^\d*$/.test(val)) return;
        const n = [...digits]; n[i] = val.slice(-1); setDigits(n);
        if (val && i < 5) otpRefs.current[i + 1]?.focus();
    };
    const onKey = (i, e) => {
        if (e.key === 'Backspace' && !digits[i] && i > 0) otpRefs.current[i - 1]?.focus();
    };
    const onPaste = e => {
        const val = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const arr = [...digits]; for (let i = 0; i < val.length; i++) arr[i] = val[i];
        setDigits(arr); otpRefs.current[Math.min(val.length, 5)]?.focus(); e.preventDefault();
    };

    const cardStyle = {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 20, padding: '18px 20px',
        backdropFilter: 'blur(20px)',
    };

    return (
        <>
            <Head title="নিবন্ধন — Exam Arena" />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

            <div style={{
                height: '100vh', display: 'flex', overflow: 'hidden',
                fontFamily: "'Hind Siliguri','Inter',sans-serif",
                background: 'linear-gradient(135deg,#05071a 0%,#0a0e23 50%,#0f1730 100%)',
            }}>
                {/* ── LEFT PANEL ─────────────────────────────────────────── */}
                <div className="hidden lg:flex" style={{
                    flex: '0 0 44%', flexDirection: 'column', justifyContent: 'center',
                    alignItems: 'center', padding: '28px 36px', position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', top: '10%', left: '5%', width: 500, height: 500, background: 'radial-gradient(circle,rgba(77,111,255,0.15) 0%,transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: 300, height: 300, background: 'radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(77,111,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(77,111,255,0.04) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

                    <div style={{ position: 'relative', zIndex: 1, maxWidth: 380, width: '100%' }}>
                        {/* Logo */}
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                            style={{ marginBottom: 32 }}>
                            <img src="/logo.png?v=1" alt="Exam Arena" style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
                        </motion.div>

                        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            style={{ fontSize: 30, fontWeight: 900, color: 'white', lineHeight: 1.2, marginBottom: 10 }}>
                            শুরু করো আজই,<br />
                            <span style={{ background: 'linear-gradient(90deg,#4d6fff,#a78bfa,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                বিনামূল্যে!
                            </span>
                        </motion.h2>
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                            style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
                            নিবন্ধন করো এবং বাংলাদেশের সেরা পরীক্ষার প্ল্যাটফর্মে যোগ দাও।
                        </motion.p>

                        {/* Benefits */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {LEFT_FEATURES.map((f, i) => (
                                <motion.div key={f.title}
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.07 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                    <span style={{ fontSize: 22 }}>{f.emoji}</span>
                                    <div>
                                        <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{f.title}</div>
                                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 1 }}>{f.desc}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Step indicator */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                            style={{ marginTop: 24, padding: '12px 14px', borderRadius: 14, background: 'rgba(77,111,255,0.1)', border: '1px solid rgba(77,111,255,0.2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600 }}>নিবন্ধনের অগ্রগতি</span>
                                <span style={{ color: '#7c94ff', fontSize: 12, fontWeight: 700 }}>{step + 1}/{STEPS.length}</span>
                            </div>
                            <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                                <motion.div
                                    animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                                    transition={{ duration: 0.5 }}
                                    style={{ height: '100%', background: 'linear-gradient(90deg,#4d6fff,#7c3aed)', borderRadius: 2 }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                                {STEPS.map((s, i) => (
                                    <span key={s} style={{ fontSize: 10, color: i <= step ? '#93b4ff' : 'rgba(255,255,255,0.2)', fontWeight: i === step ? 700 : 400 }}>{s}</span>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* ── RIGHT PANEL: Multi-step form ─────────────────────── */}
                <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: '16px 20px',
                    borderLeft: '1px solid rgba(255,255,255,0.05)',
                    overflowY: 'auto',
                }}>
                    {/* Mobile logo */}
                    <div className="flex lg:hidden" style={{ justifyContent: 'center', marginBottom: 20 }}>
                        <img src="/logo.png?v=1" alt="Exam Arena" style={{ height: 40, width: 'auto', objectFit: 'contain' }} />
                    </div>

                    <div style={{ width: '100%', maxWidth: 380 }}>
                        <AnimatePresence custom={dir} mode="wait">

                            {/* STEP 0: Account */}
                            {step === 0 && (
                                <motion.div key="s0" custom={dir} variants={slideVar} initial="enter" animate="center" exit="exit" transition={slideTrans}>
                                    <div style={{ marginBottom: 16 }}>
                                        <h1 style={{ color: 'white', fontWeight: 800, fontSize: 22, marginBottom: 4 }}>একাউন্ট তৈরি করো</h1>
                                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>নিবন্ধনে পাবে <span style={{ color: '#fbbf24', fontWeight: 700 }}>৫০ বোনাস টোকেন 🎁</span></p>
                                    </div>
                                    <div style={cardStyle}>
                                        <a href="/auth/google" style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                            padding: '11px', borderRadius: 12,
                                            background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.13)',
                                            color: 'white', fontWeight: 600, fontSize: 14, textDecoration: 'none', marginBottom: 14,
                                        }}>
                                            <svg width="17" height="17" viewBox="0 0 24 24">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                            </svg>
                                            Google দিয়ে নিবন্ধন
                                        </a>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                                            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                                            <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 12 }}>অথবা ইমেইলে</span>
                                            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                                        </div>
                                        <Field icon={User} label="তোমার নাম" value={name} onChange={setName} placeholder="যেমন: রাহাত হোসেন" />
                                        <Field icon={Mail} label="ইমেইল" type="email" value={email} onChange={setEmail} placeholder="example@gmail.com" />
                                        <Field icon={Lock} label="পাসওয়ার্ড" type={showPass ? 'text' : 'password'} value={password} onChange={setPass} placeholder="কমপক্ষে ৮ অক্ষর"
                                            right={<button onClick={() => setShowPass(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 0, display: 'flex' }}>
                                                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>} />
                                        <Err msg={err} />
                                        <Btn onClick={sendOtp} loading={loading}>পরবর্তী <ArrowRight size={14} /></Btn>
                                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, textAlign: 'center', margin: 0 }}>
                                            একাউন্ট আছে? <Link href="/login" style={{ color: '#7c94ff', fontWeight: 600, textDecoration: 'none' }}>লগইন করো</Link>
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 1: OTP */}
                            {step === 1 && (
                                <motion.div key="s1" custom={dir} variants={slideVar} initial="enter" animate="center" exit="exit" transition={slideTrans}>
                                    <div style={{ marginBottom: 16 }}>
                                        <h1 style={{ color: 'white', fontWeight: 800, fontSize: 22, marginBottom: 4 }}>ইমেইল যাচাই করো</h1>
                                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                                            <span style={{ color: '#93b4ff' }}>{email}</span>-তে কোড পাঠানো হয়েছে
                                        </p>
                                    </div>
                                    <div style={cardStyle}>
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
                                            {digits.map((d, i) => (
                                                <input key={i} ref={el => otpRefs.current[i] = el}
                                                    type="text" inputMode="numeric" maxLength={1} value={d}
                                                    onChange={e => onDigit(i, e.target.value)}
                                                    onKeyDown={e => onKey(i, e)}
                                                    onPaste={i === 0 ? onPaste : undefined}
                                                    style={{
                                                        width: 42, height: 50, textAlign: 'center',
                                                        background: d ? 'rgba(77,111,255,0.12)' : 'rgba(255,255,255,0.06)',
                                                        border: `2px solid ${d ? '#4d6fff' : 'rgba(255,255,255,0.14)'}`,
                                                        borderRadius: 11, color: 'white', fontSize: 20, fontWeight: 800, outline: 'none',
                                                    }} />
                                            ))}
                                        </div>
                                        <Err msg={err} />
                                        <Btn onClick={verifyOtp} loading={loading} disabled={digits.join('').length < 6}>
                                            <CheckCircle size={15} /> যাচাই করো
                                        </Btn>
                                        <Btn secondary onClick={resendOtp} disabled={loading}>
                                            <RefreshCw size={13} /> আবার পাঠাও
                                        </Btn>
                                        <button onClick={back} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, width: '100%', justifyContent: 'center', padding: '4px 0' }}>
                                            <ArrowLeft size={13} /> পেছনে
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 2: Goal */}
                            {step === 2 && (
                                <motion.div key="s2" custom={dir} variants={slideVar} initial="enter" animate="center" exit="exit" transition={slideTrans}>
                                    <div style={{ marginBottom: 14 }}>
                                        <h1 style={{ color: 'white', fontWeight: 800, fontSize: 22, marginBottom: 4 }}>🎯 তোমার লক্ষ্য কী?</h1>
                                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>কোন পরীক্ষার জন্য প্রস্তুতি নিচ্ছো?</p>
                                    </div>
                                    <div style={cardStyle}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7, marginBottom: 14 }}>
                                            {GOALS.map(g => (
                                                <motion.button key={g.id} onClick={() => { setGoal(g.id); setErr(''); }}
                                                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                                    style={{
                                                        padding: '10px 5px', borderRadius: 13, cursor: 'pointer', textAlign: 'center',
                                                        background: goal === g.id ? 'rgba(77,111,255,0.2)' : 'rgba(255,255,255,0.04)',
                                                        border: `2px solid ${goal === g.id ? '#4d6fff' : 'rgba(255,255,255,0.08)'}`,
                                                        transition: 'all 0.15s',
                                                    }}>
                                                    <span style={{ fontSize: 22, display: 'block', marginBottom: 3 }}>{g.emoji}</span>
                                                    <span style={{ color: goal === g.id ? '#93b4ff' : 'rgba(255,255,255,0.7)', fontWeight: goal === g.id ? 700 : 500, fontSize: 12, display: 'block' }}>{g.label}</span>
                                                </motion.button>
                                            ))}
                                        </div>
                                        <Err msg={err} />
                                        <Btn onClick={confirmGoal} disabled={!goal}>পরবর্তী <ArrowRight size={14} /></Btn>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 3: Notifications */}
                            {step === 3 && (
                                <motion.div key="s3" custom={dir} variants={slideVar} initial="enter" animate="center" exit="exit" transition={slideTrans}>
                                    <div style={{ marginBottom: 14 }}>
                                        <h1 style={{ color: 'white', fontWeight: 800, fontSize: 22, marginBottom: 4 }}>🔔 নোটিফিকেশন চালু করো</h1>
                                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>কনটেস্ট, টোকেন ও ব্যাটেল মিস করবে না!</p>
                                    </div>
                                    <div style={cardStyle}>
                                        <div style={{ background: 'rgba(77,111,255,0.07)', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
                                            {[['⚡','লাইভ কনটেস্ট শুরুর নোটিশ'],['⚔️','ব্যাটেল চ্যালেঞ্জ ইনভাইট'],['🎁','দৈনিক টোকেন রিমাইন্ডার'],['🏆','লিডারবোর্ড আপডেট']].map(([e,t]) => (
                                                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
                                                    <span style={{ fontSize: 16 }}>{e}</span>
                                                    <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>{t}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <Err msg={err} />
                                        <Btn onClick={() => finish(true)} loading={loading}><Bell size={15} /> চালু করে শুরু করি!</Btn>
                                        <Btn secondary onClick={() => finish(false)} disabled={loading}><BellOff size={13} /> পরে চালু করব</Btn>
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </>
    );
}
