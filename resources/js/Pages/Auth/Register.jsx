import { useState, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
    User, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft,
    CheckCircle, Bell, BellOff, Loader2, RefreshCw, Shield,
    Zap,
} from 'lucide-react';

// ── Exam goals ─────────────────────────────────────────────────────────────────
const GOALS = [
    { id: 'ssc',         emoji: '📗', label: 'SSC',         desc: 'মাধ্যমিক' },
    { id: 'hsc',         emoji: '📘', label: 'HSC',         desc: 'উচ্চ মাধ্যমিক' },
    { id: 'bcs',         emoji: '🏛️', label: 'BCS',         desc: 'সিভিল সার্ভিস' },
    { id: 'medical',     emoji: '⚕️', label: 'Medical',     desc: 'MBBS ভর্তি' },
    { id: 'engineering', emoji: '⚙️', label: 'Engineering', desc: 'বুয়েট ভর্তি' },
    { id: 'bank',        emoji: '🏦', label: 'Bank Job',    desc: 'ব্যাংক নিয়োগ' },
    { id: 'university',  emoji: '🎓', label: 'University',  desc: 'ভার্সিটি ভর্তি' },
    { id: 'primary',     emoji: '✏️', label: 'Primary',     desc: 'প্রাথমিক শিক্ষক' },
    { id: 'other',       emoji: '📋', label: 'Other',       desc: 'অন্যান্য' },
];

const STEP_LABELS = ['একাউন্ট', 'যাচাই', 'লক্ষ্য', 'প্রস্তুত!'];

// ── Shared styles ─────────────────────────────────────────────────────────────
const BG = 'linear-gradient(135deg,#05071a 0%,#0a0e23 50%,#0f1730 100%)';

const cardStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 24,
    padding: '28px 24px',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
};

const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1.5px solid rgba(255,255,255,0.12)',
    borderRadius: 13,
    color: 'white',
    padding: '14px 14px 14px 40px',
    fontSize: 15,
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
};

const labelStyle = {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: 6,
    display: 'block',
};

// ── Animation variants ─────────────────────────────────────────────────────────
const slideVar = {
    enter: d => ({ x: d * 50, opacity: 0, scale: 0.97 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: d => ({ x: -d * 50, opacity: 0, scale: 0.97 }),
};
const slideTrans = { type: 'spring', stiffness: 380, damping: 40 };

// ── Sub-components ─────────────────────────────────────────────────────────────
function Field({ icon: Icon, label, type = 'text', value, onChange, placeholder, right }) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>{label}</label>
            <div style={{ position: 'relative' }}>
                <Icon size={15} style={{
                    position: 'absolute', left: 13, top: '50%',
                    transform: 'translateY(-50%)',
                    color: focused ? '#7c94ff' : 'rgba(255,255,255,0.3)',
                    transition: 'color 0.2s',
                }} />
                <input
                    type={type} value={value} placeholder={placeholder}
                    onChange={e => onChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={{
                        ...inputStyle,
                        borderColor: focused ? '#4d6fff' : 'rgba(255,255,255,0.12)',
                        paddingRight: right ? 42 : 14,
                    }}
                />
                {right && (
                    <div style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)' }}>
                        {right}
                    </div>
                )}
            </div>
        </div>
    );
}

function Btn({ onClick, loading, disabled, children, secondary }) {
    return (
        <button
            onClick={onClick}
            disabled={loading || disabled}
            style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 13,
                background: secondary
                    ? 'rgba(255,255,255,0.06)'
                    : (loading || disabled)
                        ? 'rgba(77,111,255,0.35)'
                        : 'linear-gradient(135deg,#4d6fff,#7c3aed)',
                border: secondary ? '1px solid rgba(255,255,255,0.1)' : 'none',
                color: secondary ? 'rgba(255,255,255,0.5)' : 'white',
                fontWeight: secondary ? 500 : 700,
                fontSize: 15,
                cursor: (loading || disabled) ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
                boxShadow: (!secondary && !loading && !disabled) ? '0 6px 24px rgba(77,111,255,0.35)' : 'none',
                marginBottom: 10,
            }}
        >
            {loading ? <Loader2 size={18} className="animate-spin" /> : children}
        </button>
    );
}

function Err({ msg }) {
    if (!msg) return null;
    return (
        <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            style={{ color: '#f87171', fontSize: 13, textAlign: 'center', padding: '8px 12px', background: 'rgba(248,113,113,0.1)', borderRadius: 10, marginBottom: 12 }}>
            {msg}
        </motion.div>
    );
}

// ── Main component ─────────────────────────────────────────────────────────────
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

    // Step 1 → 2: send OTP
    const sendOtp = async () => {
        if (!name.trim()) return setErr('নাম লিখুন।');
        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return setErr('সঠিক ইমেইল দিন।');
        if (password.length < 8) return setErr('পাসওয়ার্ড কমপক্ষে ৮ অক্ষর।');
        setLoading(true); setErr('');
        try {
            await axios.post('/auth/send-otp', { name, email });
            next();
        } catch (e) {
            setErr(e.response?.data?.message ?? 'ইমেইল পাঠানো সম্ভব হয়নি।');
        } finally { setLoading(false); }
    };

    // Step 2 → 3: verify OTP
    const verifyOtp = async () => {
        const code = digits.join('');
        if (code.length < 6) return setErr('৬ সংখ্যার কোড দিন।');
        setLoading(true); setErr('');
        try {
            await axios.post('/auth/verify-otp', { email, otp: code });
            next();
        } catch (e) {
            setErr(e.response?.data?.message ?? 'ভুল কোড। আবার চেষ্টা করুন।');
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
        } catch (e) {
            setErr(e.response?.data?.message ?? 'পুনরায় পাঠানো যায়নি।');
        } finally { setLoading(false); }
    };

    // Step 3 → 4: select goal
    const confirmGoal = () => {
        if (!goal) return setErr('একটি লক্ষ্য বেছে নিন।');
        next();
    };

    // Step 4: request notif + register
    const finish = async (withNotif) => {
        if (withNotif && 'Notification' in window) {
            await Notification.requestPermission().catch(() => {});
        }
        setLoading(true); setErr('');
        router.post('/register', {
            name, email,
            password, password_confirmation: password,
            exam_goal: goal,
        }, {
            onError: errs => {
                const msg = Object.values(errs)[0] ?? 'নিবন্ধন ব্যর্থ হয়েছে।';
                setErr(msg);
                setLoading(false);
            },
        });
    };

    // OTP digit helpers
    const onDigit = (i, val) => {
        if (!/^\d*$/.test(val)) return;
        const next = [...digits]; next[i] = val.slice(-1); setDigits(next);
        if (val && i < 5) otpRefs.current[i + 1]?.focus();
    };
    const onKey = (i, e) => {
        if (e.key === 'Backspace' && !digits[i] && i > 0) otpRefs.current[i - 1]?.focus();
        if (e.key === 'ArrowLeft' && i > 0) otpRefs.current[i - 1]?.focus();
        if (e.key === 'ArrowRight' && i < 5) otpRefs.current[i + 1]?.focus();
    };
    const onPaste = e => {
        const val = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const arr = [...digits];
        for (let i = 0; i < val.length; i++) arr[i] = val[i];
        setDigits(arr);
        otpRefs.current[Math.min(val.length, 5)]?.focus();
        e.preventDefault();
    };

    return (
        <div style={{
            minHeight: '100vh', background: BG, color: '#e2e8f0',
            fontFamily: "'Hind Siliguri','Inter',sans-serif",
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '24px 16px', overflowX: 'hidden',
        }}>
            <Head title="নিবন্ধন — Exam Arena" />

            {/* Glow orbs */}
            <div style={{ position: 'fixed', top: '5%', left: '15%', width: 500, height: 500, background: 'radial-gradient(circle,rgba(77,111,255,0.12) 0%,transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '10%', right: '5%', width: 350, height: 350, background: 'radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

            {/* Logo */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg,#4d6fff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(77,111,255,0.4)' }}>
                    <Zap size={20} color="white" fill="white" />
                </div>
                <div>
                    <div style={{ fontWeight: 800, fontSize: 17, color: 'white', lineHeight: 1.1 }}>Exam Arena</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>by NXLY</div>
                </div>
            </motion.div>

            {/* Progress stepper */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ width: '100%', maxWidth: 360, marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {STEP_LABELS.map((label, i) => (
                        <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                            <motion.div
                                animate={{
                                    background: i < step
                                        ? 'linear-gradient(135deg,#10b981,#059669)'
                                        : i === step
                                            ? 'linear-gradient(135deg,#4d6fff,#7c3aed)'
                                            : 'rgba(255,255,255,0.07)',
                                    boxShadow: i === step ? '0 0 14px rgba(77,111,255,0.5)' : 'none',
                                }}
                                transition={{ duration: 0.4 }}
                                style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: i <= step ? 'white' : 'rgba(255,255,255,0.25)' }}>
                                {i < step ? <CheckCircle size={15} /> : i + 1}
                            </motion.div>
                            <span style={{ fontSize: 10, marginTop: 5, fontWeight: i === step ? 700 : 400, color: i <= step ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.22)' }}>
                                {label}
                            </span>
                            {/* connector line */}
                            {i < STEP_LABELS.length - 1 && (
                                <div style={{ position: 'absolute' }} />
                            )}
                        </div>
                    ))}
                </div>
                {/* Progress bar */}
                <div style={{ height: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 2, marginTop: 8 }}>
                    <motion.div
                        animate={{ width: `${(step / (STEP_LABELS.length - 1)) * 100}%` }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        style={{ height: '100%', background: 'linear-gradient(90deg,#4d6fff,#7c3aed)', borderRadius: 2 }}
                    />
                </div>
            </motion.div>

            {/* Step content */}
            <div style={{ width: '100%', maxWidth: 360 }}>
                <AnimatePresence custom={dir} mode="wait">

                    {/* ── STEP 0: Account info ─────────────────────────────── */}
                    {step === 0 && (
                        <motion.div key="s0" custom={dir} variants={slideVar} initial="enter" animate="center" exit="exit" transition={slideTrans}>
                            <div style={cardStyle}>
                                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                    <h2 style={{ color: 'white', fontWeight: 800, fontSize: 21, margin: 0 }}>একাউন্ট তৈরি করো</h2>
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 5, marginBottom: 0 }}>নিবন্ধন করলেই পাবে <span style={{ color: '#fbbf24', fontWeight: 700 }}>৫০ বোনাস টোকেন</span> 🎁</p>
                                </div>

                                {/* Google button */}
                                <a href="/auth/google"
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                        padding: '13px', borderRadius: 13,
                                        background: 'rgba(255,255,255,0.07)',
                                        border: '1.5px solid rgba(255,255,255,0.14)',
                                        color: 'white', fontWeight: 600, fontSize: 14,
                                        textDecoration: 'none', marginBottom: 16,
                                        transition: 'background 0.2s',
                                    }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                    </svg>
                                    Google দিয়ে নিবন্ধন
                                </a>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                                    <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 12 }}>অথবা ইমেইলে</span>
                                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                                </div>

                                <Field icon={User} label="তোমার নাম" value={name} onChange={setName} placeholder="যেমন: রাহাত হোসেন" />
                                <Field icon={Mail} label="ইমেইল ঠিকানা" type="email" value={email} onChange={setEmail} placeholder="example@gmail.com" />
                                <Field
                                    icon={Lock} label="পাসওয়ার্ড"
                                    type={showPass ? 'text' : 'password'}
                                    value={password} onChange={setPass}
                                    placeholder="কমপক্ষে ৮ অক্ষর"
                                    right={
                                        <button onClick={() => setShowPass(p => !p)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 0, display: 'flex' }}>
                                            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    }
                                />

                                <Err msg={err} />
                                <Btn onClick={sendOtp} loading={loading}>
                                    পরবর্তী — ইমেইল যাচাই <ArrowRight size={16} />
                                </Btn>

                                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, textAlign: 'center', margin: 0 }}>
                                    একাউন্ট আছে?{' '}
                                    <Link href="/login" style={{ color: '#7c94ff', fontWeight: 600, textDecoration: 'none' }}>লগইন করো</Link>
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* ── STEP 1: OTP ──────────────────────────────────────── */}
                    {step === 1 && (
                        <motion.div key="s1" custom={dir} variants={slideVar} initial="enter" animate="center" exit="exit" transition={slideTrans}>
                            <div style={cardStyle}>
                                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                    <motion.div
                                        animate={{ scale: [1, 1.08, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(77,111,255,0.2),rgba(124,58,237,0.2))', border: '1px solid rgba(77,111,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                                        <Mail size={26} style={{ color: '#7c94ff' }} />
                                    </motion.div>
                                    <h2 style={{ color: 'white', fontWeight: 800, fontSize: 20, marginBottom: 6 }}>ইমেইল যাচাই করো</h2>
                                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.5, margin: 0 }}>
                                        <span style={{ color: '#93b4ff', fontWeight: 600 }}>{email}</span>-তে<br />৬ সংখ্যার কোড পাঠানো হয়েছে।
                                    </p>
                                </div>

                                {/* OTP boxes */}
                                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
                                    {digits.map((d, i) => (
                                        <input key={i}
                                            ref={el => otpRefs.current[i] = el}
                                            type="text" inputMode="numeric" maxLength={1}
                                            value={d}
                                            onChange={e => onDigit(i, e.target.value)}
                                            onKeyDown={e => onKey(i, e)}
                                            onPaste={i === 0 ? onPaste : undefined}
                                            style={{
                                                width: 44, height: 54, textAlign: 'center',
                                                background: d ? 'rgba(77,111,255,0.12)' : 'rgba(255,255,255,0.06)',
                                                border: `2px solid ${d ? '#4d6fff' : 'rgba(255,255,255,0.14)'}`,
                                                borderRadius: 12, color: 'white',
                                                fontSize: 22, fontWeight: 800, outline: 'none',
                                                transition: 'all 0.15s',
                                                boxShadow: d ? '0 0 10px rgba(77,111,255,0.25)' : 'none',
                                            }}
                                        />
                                    ))}
                                </div>

                                <Err msg={err} />
                                <Btn onClick={verifyOtp} loading={loading} disabled={digits.join('').length < 6}>
                                    <CheckCircle size={16} /> যাচাই করো
                                </Btn>
                                <Btn secondary onClick={resendOtp} disabled={loading}>
                                    <RefreshCw size={14} /> কোড আসেনি? আবার পাঠাও
                                </Btn>
                                <button onClick={back} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, width: '100%', justifyContent: 'center', padding: '6px 0' }}>
                                    <ArrowLeft size={13} /> পেছনে যাও
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── STEP 2: Goal selection ───────────────────────────── */}
                    {step === 2 && (
                        <motion.div key="s2" custom={dir} variants={slideVar} initial="enter" animate="center" exit="exit" transition={slideTrans}>
                            <div style={cardStyle}>
                                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                    <motion.span
                                        animate={{ rotate: [0, 10, -10, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        style={{ fontSize: 40, display: 'block', marginBottom: 10 }}>🎯</motion.span>
                                    <h2 style={{ color: 'white', fontWeight: 800, fontSize: 20, marginBottom: 5 }}>তোমার লক্ষ্য কী?</h2>
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>কোন পরীক্ষার জন্য প্রস্তুতি নিচ্ছো?</p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
                                    {GOALS.map(g => (
                                        <motion.button key={g.id}
                                            onClick={() => { setGoal(g.id); setErr(''); }}
                                            whileHover={{ scale: 1.04 }}
                                            whileTap={{ scale: 0.96 }}
                                            style={{
                                                padding: '12px 6px',
                                                borderRadius: 14,
                                                background: goal === g.id
                                                    ? 'linear-gradient(135deg,rgba(77,111,255,0.25),rgba(124,58,237,0.18))'
                                                    : 'rgba(255,255,255,0.04)',
                                                border: `2px solid ${goal === g.id ? '#4d6fff' : 'rgba(255,255,255,0.08)'}`,
                                                cursor: 'pointer', textAlign: 'center',
                                                transition: 'all 0.18s',
                                                boxShadow: goal === g.id ? '0 4px 18px rgba(77,111,255,0.22)' : 'none',
                                            }}>
                                            <span style={{ fontSize: 24, display: 'block', marginBottom: 4 }}>{g.emoji}</span>
                                            <span style={{ color: goal === g.id ? '#93b4ff' : 'rgba(255,255,255,0.7)', fontWeight: goal === g.id ? 700 : 500, fontSize: 12, display: 'block' }}>{g.label}</span>
                                            <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, display: 'block', marginTop: 2 }}>{g.desc}</span>
                                        </motion.button>
                                    ))}
                                </div>

                                <Err msg={err} />
                                <Btn onClick={confirmGoal} disabled={!goal}>
                                    পরবর্তী <ArrowRight size={16} />
                                </Btn>
                            </div>
                        </motion.div>
                    )}

                    {/* ── STEP 3: Notification + Finish ───────────────────── */}
                    {step === 3 && (
                        <motion.div key="s3" custom={dir} variants={slideVar} initial="enter" animate="center" exit="exit" transition={slideTrans}>
                            <div style={{ ...cardStyle, textAlign: 'center' }}>
                                <motion.div
                                    animate={{ y: [0, -6, 0], rotate: [0, 8, -8, 0] }}
                                    transition={{ duration: 2.5, repeat: Infinity }}
                                    style={{ fontSize: 52, marginBottom: 14, display: 'block' }}>🔔</motion.div>

                                <h2 style={{ color: 'white', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>নোটিফিকেশন চালু করো</h2>
                                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
                                    যাতে কোনো লাইভ কনটেস্ট, ব্যাটেল ইনভাইট বা<br />দৈনিক টোকেন মিস না হয়!
                                </p>

                                {/* Benefits */}
                                <div style={{ background: 'rgba(77,111,255,0.08)', borderRadius: 14, padding: '14px 16px', marginBottom: 20, textAlign: 'left' }}>
                                    {[
                                        ['⚡', 'লাইভ কনটেস্ট শুরুর নোটিশ'],
                                        ['⚔️', 'ব্যাটেল চ্যালেঞ্জ ইনভাইট'],
                                        ['🎁', 'দৈনিক টোকেন ক্লেইম রিমাইন্ডার'],
                                        ['🏆', 'লিডারবোর্ড আপডেট'],
                                    ].map(([emoji, txt]) => (
                                        <div key={txt} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                            <span>{emoji}</span>
                                            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{txt}</span>
                                        </div>
                                    ))}
                                </div>

                                <Err msg={err} />
                                <Btn onClick={() => finish(true)} loading={loading}>
                                    <Bell size={17} /> চালু করে শুরু করি!
                                </Btn>
                                <Btn secondary onClick={() => finish(false)} disabled={loading}>
                                    <BellOff size={14} /> এখন নয়, পরে চালু করব
                                </Btn>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
