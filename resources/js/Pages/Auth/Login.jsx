import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Zap } from 'lucide-react';
import { useState } from 'react';

// ── Google Icon SVG ────────────────────────────────────────────────────────────
function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
    );
}

export default function Login({ status, canResetPassword }) {
    const [showPass, setShowPass] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '', password: '', remember: false,
    });

    useEffect(() => () => reset('password'), []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <>
            <Head title="লগইন — NXLY Exam Arena" />

            <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
                style={{ background: 'linear-gradient(135deg, #05071a 0%, #0a0e23 40%, #0f1a3e 100%)' }}>

                {/* Glow */}
                <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(77,111,255,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-sm"
                >
                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 overflow-hidden"
                            style={{ background: 'linear-gradient(135deg, #4d6fff, #7c3aed)', boxShadow: '0 8px 32px rgba(77,111,255,0.4)' }}>
                            <img src="/logo.png" alt="NXLY" className="w-full h-full object-cover"
                                onError={e => { e.target.style.display='none'; e.target.parentElement.innerHTML='<span style="color:white;font-size:28px;font-weight:900">N</span>'; }} />
                        </div>
                        <h1 className="text-white font-black text-2xl">স্বাগতম!</h1>
                        <p className="text-white/50 text-sm mt-1">NXLY Exam Arena তে লগইন করুন</p>
                    </div>

                    {/* Card */}
                    <div className="p-6 rounded-3xl"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>

                        {status && (
                            <div className="mb-4 p-3 rounded-xl text-sm text-green-400"
                                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                {status}
                            </div>
                        )}

                        {/* Google OAuth */}
                        <a href={route('auth.google')}
                            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-semibold text-sm text-white mb-4 transition-all active:scale-95"
                            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                            <GoogleIcon />
                            Google দিয়ে লগইন করুন
                        </a>

                        {/* Divider */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
                            <span className="text-white/30 text-xs">অথবা ইমেইল দিয়ে</span>
                            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            {/* Email */}
                            <div>
                                <label className="block text-white/60 text-xs font-medium mb-1.5">ইমেইল</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        placeholder="আপনার ইমেইল"
                                        className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm text-white placeholder-white/30 outline-none transition-all"
                                        style={{
                                            background: 'rgba(255,255,255,0.07)',
                                            border: errors.email ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(255,255,255,0.1)',
                                        }}
                                        required autoFocus
                                    />
                                </div>
                                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-white/60 text-xs font-medium mb-1.5">পাসওয়ার্ড</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        placeholder="আপনার পাসওয়ার্ড"
                                        className="w-full pl-10 pr-11 py-3.5 rounded-2xl text-sm text-white placeholder-white/30 outline-none"
                                        style={{
                                            background: 'rgba(255,255,255,0.07)',
                                            border: errors.password ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(255,255,255,0.1)',
                                        }}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPass(p => !p)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                            </div>

                            {/* Remember + Forgot */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={data.remember}
                                        onChange={e => setData('remember', e.target.checked)}
                                        className="w-4 h-4 rounded accent-blue-500" />
                                    <span className="text-white/50 text-xs">মনে রাখুন</span>
                                </label>
                                {canResetPassword && (
                                    <Link href={route('password.request')} className="text-xs" style={{ color: '#93b4ff' }}>
                                        পাসওয়ার্ড ভুলে গেছেন?
                                    </Link>
                                )}
                            </div>

                            {/* Submit */}
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                type="submit"
                                disabled={processing}
                                className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 transition-opacity"
                                style={{
                                    background: 'linear-gradient(135deg, #4d6fff, #7c3aed)',
                                    boxShadow: '0 8px 32px rgba(77,111,255,0.35)',
                                    opacity: processing ? 0.7 : 1,
                                }}
                            >
                                {processing ? (
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                                    </svg>
                                ) : (
                                    <><Zap size={18} /> লগইন করুন</>
                                )}
                            </motion.button>
                        </form>
                    </div>

                    {/* Register link */}
                    <p className="text-center text-white/50 text-sm mt-5">
                        অ্যাকাউন্ট নেই?{' '}
                        <Link href={route('register')} className="font-semibold" style={{ color: '#93b4ff' }}>
                            বিনামূল্যে নিবন্ধন করুন →
                        </Link>
                    </p>
                </motion.div>
            </div>
        </>
    );
}
