import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { User, Lock, Trash2, Save, Camera, CheckCircle, Loader2, Eye, EyeOff, GraduationCap } from 'lucide-react';
import axios from 'axios';
import MobileLayout from '@/Layouts/MobileLayout';

const GOALS = [
    { id: 'bcs',         emoji: '🏛️', label: 'BCS' },
    { id: 'hsc',         emoji: '📘', label: 'HSC' },
    { id: 'ssc',         emoji: '📗', label: 'SSC' },
    { id: 'medical',     emoji: '⚕️', label: 'মেডিকেল' },
    { id: 'engineering', emoji: '⚙️', label: 'ইঞ্জিনিয়ারিং' },
    { id: 'bank',        emoji: '🏦', label: 'ব্যাংক জব' },
    { id: 'university',  emoji: '🎓', label: 'ভার্সিটি' },
    { id: 'primary',     emoji: '✏️', label: 'প্রাইমারি' },
    { id: 'other',       emoji: '📋', label: 'অন্যান্য' },
];

const STREAMS = [
    { id: 'science',  emoji: '🔬', label: 'বিজ্ঞান (Science)' },
    { id: 'arts',     emoji: '📜', label: 'মানবিক (Arts)' },
    { id: 'commerce', emoji: '💼', label: 'বাণিজ্য (Commerce)' },
];

const card = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16, padding: 20, marginBottom: 16,
};

const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'white', fontSize: 14, outline: 'none',
};

const labelStyle = {
    color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 700,
    letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6,
};

function SectionLabel({ icon: Icon, text }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
            <Icon size={15} style={{ color: '#4d6fff' }} />
            <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{text}</span>
        </div>
    );
}

export default function Edit({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    const user = auth.user;

    // ── Profile Info form ────────────────────────────────────────────────────
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        name:  user.name ?? '',
        email: user.email ?? '',
    });

    const submitInfo = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    // ── Password form ────────────────────────────────────────────────────────
    const pwForm = useForm({ current_password: '', password: '', password_confirmation: '' });
    const [showPw, setShowPw] = useState(false);

    const submitPw = (e) => {
        e.preventDefault();
        pwForm.put(route('password.update'), { onFinish: () => pwForm.reset() });
    };

    // ── Avatar upload ────────────────────────────────────────────────────────
    const [avatarPreview, setAvatarPreview] = useState(
        user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `/storage/${user.avatar}`) : null
    );
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const csrf = document.querySelector('meta[name="csrf-token"]')?.content ?? '';

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarPreview(URL.createObjectURL(file));
        setUploadingAvatar(true);
        const fd = new FormData();
        fd.append('avatar', file);
        fd.append('_token', csrf);
        await fetch(route('profile.avatar'), { method: 'POST', body: fd }).catch(() => {});
        setUploadingAvatar(false);
    };

    // ── Exam goal & stream setup ─────────────────────────────────────────────
    const currentGoals  = Array.isArray(user.exam_goal) ? user.exam_goal : [];
    const currentGoal   = currentGoals[0] ?? null;
    const [selGoal,   setSelGoal]   = useState(currentGoal);
    const [selStream, setSelStream] = useState(user.stream ?? null);
    const [setupSaving,   setSetupSaving]   = useState(false);
    const [setupSaved,    setSetupSaved]    = useState(false);

    const needsStream = selGoal === 'hsc' || selGoal === 'ssc';

    const saveSetup = async () => {
        if (!selGoal) return;
        setSetupSaving(true);
        try {
            await axios.post(route('profile.setup'), {
                exam_goal: selGoal,
                stream:    needsStream ? selStream : null,
            });
            setSetupSaved(true);
            setTimeout(() => setSetupSaved(false), 2500);
        } catch (e) {
            // silent
        }
        setSetupSaving(false);
    };

    return (
        <MobileLayout title="প্রোফাইল">
            <Head title="প্রোফাইল" />

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            {/* ── Avatar ────────────────────────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ position: 'relative' }}>
                    <div style={{
                        width: 90, height: 90, borderRadius: '50%',
                        background: 'linear-gradient(135deg,#4d6fff,#7c3aed)',
                        border: '3px solid rgba(77,111,255,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden',
                    }}>
                        {avatarPreview
                            ? <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ color: 'white', fontWeight: 800, fontSize: 28 }}>{user.name?.[0]?.toUpperCase() ?? 'U'}</span>
                        }
                    </div>
                    <label style={{
                        position: 'absolute', bottom: 2, right: 2,
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'linear-gradient(135deg,#4d6fff,#7c3aed)',
                        border: '2px solid #0a0e23',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                    }}>
                        {uploadingAvatar
                            ? <Loader2 size={12} color="white" style={{ animation: 'spin 1s linear infinite' }} />
                            : <Camera size={12} color="white" />
                        }
                        <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                    </label>
                </div>
                <div style={{ marginTop: 10, textAlign: 'center' }}>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>{user.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{user.email}</div>
                </div>
                {/* Token + wallet row */}
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <div style={{ padding: '6px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#fcd34d', fontSize: 13, fontWeight: 700 }}>
                        🪙 {user.token_balance ?? 0} Token
                    </div>
                    <div style={{ padding: '6px 14px', borderRadius: 10, background: 'rgba(77,111,255,0.12)', border: '1px solid rgba(77,111,255,0.25)', color: '#93b4ff', fontSize: 13, fontWeight: 700 }}>
                        ৳{parseFloat(user.wallet_balance ?? 0).toFixed(0)} Wallet
                    </div>
                </div>
            </div>

            {/* ── Exam Goal & Stream ─────────────────────────────────────────── */}
            <div style={card}>
                <SectionLabel icon={GraduationCap} text="পরীক্ষার লক্ষ্য ও বিভাগ" />

                {/* Goal selector */}
                <label style={labelStyle}>আমার লক্ষ্য</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                    {GOALS.map(g => (
                        <motion.button
                            key={g.id}
                            whileTap={{ scale: 0.93 }}
                            onClick={() => { setSelGoal(g.id); setSelStream(null); }}
                            style={{
                                padding: '7px 14px', borderRadius: 20, cursor: 'pointer',
                                fontSize: 13, fontWeight: 600, border: '1px solid',
                                background: selGoal === g.id ? 'rgba(77,111,255,0.2)' : 'rgba(255,255,255,0.04)',
                                borderColor: selGoal === g.id ? 'rgba(77,111,255,0.5)' : 'rgba(255,255,255,0.1)',
                                color: selGoal === g.id ? '#93b4ff' : 'rgba(255,255,255,0.55)',
                                transition: 'all 0.15s',
                            }}
                        >
                            {g.emoji} {g.label}
                        </motion.button>
                    ))}
                </div>

                {/* Stream selector — only for HSC/SSC */}
                {needsStream && (
                    <>
                        <label style={labelStyle}>বিভাগ (Stream)</label>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                            {STREAMS.map(s => (
                                <motion.button
                                    key={s.id}
                                    whileTap={{ scale: 0.93 }}
                                    onClick={() => setSelStream(s.id)}
                                    style={{
                                        padding: '7px 16px', borderRadius: 20, cursor: 'pointer',
                                        fontSize: 13, fontWeight: 600, border: '1px solid',
                                        background: selStream === s.id ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.04)',
                                        borderColor: selStream === s.id ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.1)',
                                        color: selStream === s.id ? '#34d399' : 'rgba(255,255,255,0.55)',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    {s.emoji} {s.label}
                                </motion.button>
                            ))}
                        </div>
                    </>
                )}

                {/* Save button */}
                <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={saveSetup}
                    disabled={setupSaving || !selGoal || (needsStream && !selStream)}
                    style={{
                        padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: setupSaved
                            ? 'linear-gradient(135deg,#10b981,#059669)'
                            : 'linear-gradient(135deg,#4d6fff,#7c3aed)',
                        color: 'white', fontWeight: 700, fontSize: 13,
                        display: 'flex', alignItems: 'center', gap: 6,
                        opacity: (!selGoal || (needsStream && !selStream)) ? 0.5 : 1,
                    }}
                >
                    {setupSaving
                        ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                        : <CheckCircle size={14} />
                    }
                    {setupSaved ? 'সেভ হয়েছে! ✓' : 'লক্ষ্য সেভ করো'}
                </motion.button>
            </div>

            {/* ── Update info ───────────────────────────────────────────────── */}
            <div style={card}>
                <SectionLabel icon={User} text="তথ্য আপডেট করো" />
                <form onSubmit={submitInfo}>
                    <div style={{ marginBottom: 12 }}>
                        <label style={labelStyle}>নাম</label>
                        <input value={data.name} onChange={e => setData('name', e.target.value)}
                            style={inputStyle} />
                        {errors.name && <p style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>{errors.name}</p>}
                    </div>
                    <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>ইমেইল</label>
                        <input type="email" value={data.email} onChange={e => setData('email', e.target.value)}
                            style={inputStyle} />
                        {errors.email && <p style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>{errors.email}</p>}
                    </div>
                    {recentlySuccessful && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#34d399', fontSize: 12, marginBottom: 10 }}>
                            <CheckCircle size={13} /> সেভ হয়েছে!
                        </div>
                    )}
                    <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={processing}
                        style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#4d6fff,#7c3aed)', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {processing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
                        সেভ করো
                    </motion.button>
                </form>
            </div>

            {/* ── Change Password ───────────────────────────────────────────── */}
            <div style={card}>
                <SectionLabel icon={Lock} text={user.has_password !== false ? "পাসওয়ার্ড পরিবর্তন" : "নতুন পাসওয়ার্ড সেট করুন (Google User)"} />
                <form onSubmit={submitPw}>
                    {user.has_password === false && (
                        <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399', fontSize: 11, marginBottom: 12 }}>
                            ✨ Google দিয়ে সাইন-আপ করায় কোনো পুরাতন পাসওয়ার্ড নেই। সরাসরি একটি নতুন পাসওয়ার্ড সেট করুন।
                        </div>
                    )}
                    {[
                        ...(user.has_password !== false ? [{ label: 'বর্তমান পাসওয়ার্ড', field: 'current_password' }] : []),
                        { label: 'নতুন পাসওয়ার্ড', field: 'password' },
                        { label: 'পাসওয়ার্ড নিশ্চিত করো', field: 'password_confirmation' },
                    ].map(({ label, field }) => (
                        <div key={field} style={{ marginBottom: 12, position: 'relative' }}>
                            <label style={labelStyle}>{label}</label>
                            <input type={showPw ? 'text' : 'password'}
                                value={pwForm.data[field]}
                                onChange={e => pwForm.setData(field, e.target.value)}
                                style={{ ...inputStyle, paddingRight: 40 }} />
                            {pwForm.errors[field] && <p style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>{pwForm.errors[field]}</p>}
                        </div>
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <button type="button" onClick={() => setShowPw(!showPw)}
                            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer' }}>
                            {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                            {showPw ? 'পাসওয়ার্ড লুকাও' : 'পাসওয়ার্ড দেখাও'}
                        </button>
                    </div>
                    {pwForm.recentlySuccessful && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#34d399', fontSize: 12, marginBottom: 10 }}>
                            <CheckCircle size={13} /> পাসওয়ার্ড পরিবর্তন হয়েছে!
                        </div>
                    )}
                    <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={pwForm.processing}
                        style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#4d6fff,#7c3aed)', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {pwForm.processing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Lock size={14} />}
                        পাসওয়ার্ড পরিবর্তন করো
                    </motion.button>
                </form>
            </div>
        </MobileLayout>
    );
}
