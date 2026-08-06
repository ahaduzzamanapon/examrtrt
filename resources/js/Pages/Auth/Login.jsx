import { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Zap, Trophy, Sword, BookOpen, Users } from 'lucide-react';

const FEATURES = [
    { icon: Zap,      color: '#4d6fff', label: 'লাইভ কনটেস্ট',     desc: 'শত প্রতিযোগীর সাথে রিয়েলটাইম পরীক্ষা' },
    { icon: Sword,    color: '#f59e0b', label: '১ vs ১ ব্যাটেল',   desc: 'যেকাউকে চ্যালেঞ্জ করো, জিতো টোকেন' },
    { icon: BookOpen, color: '#10b981', label: 'AI প্র্যাকটিস',    desc: 'BCS, HSC, SSC — সব বিষয়ে AI প্রশ্ন' },
    { icon: Trophy,   color: '#a78bfa', label: 'লিডারবোর্ড',       desc: 'শীর্ষে উঠে আসো, পুরস্কার জিতো' },
];

export default function Login({ status, canResetPassword }) {
    const [showPass, setShowPass] = useState(false);
    const [activeFeature, setActiveFeature] = useState(0);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '', password: '', remember: false,
    });

    useEffect(() => {
        const t = setInterval(() => setActiveFeature(f => (f + 1) % FEATURES.length), 3000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => () => reset('password'), []);

    const submit = e => { e.preventDefault(); post(route('login')); };

    return (
        <>
            <Head title="লগইন — Exam Arena" />
            <div style={{
                minHeight: '100vh', display: 'flex',
                fontFamily: "'Hind Siliguri','Inter',sans-serif",
                background: 'linear-gradient(135deg,#05071a 0%,#0a0e23 50%,#0f1730 100%)',
            }}>

                {/* ── LEFT PANEL (Desktop only) ───────────────────────────── */}
                <div className="hidden lg:flex" style={{
                    flex: '0 0 48%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    padding: '40px', position: 'relative', overflow: 'hidden',
                }}>
                    {/* BG glow */}
                    <div style={{ position: 'absolute', top: '10%', left: '10%', width: 500, height: 500, background: 'radial-gradient(circle,rgba(77,111,255,0.18) 0%,transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: 300, height: 300, background: 'radial-gradient(circle,rgba(124,58,237,0.15) 0%,transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

                    {/* Grid pattern */}
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(77,111,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(77,111,255,0.04) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

                    <div style={{ position: 'relative', zIndex: 1, maxWidth: 420, width: '100%' }}>
                        {/* Logo */}
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                            style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 13, background: 'linear-gradient(135deg,#4d6fff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 24px rgba(77,111,255,0.45)' }}>
                                <Zap size={22} color="white" fill="white" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: 20, color: 'white' }}>Exam Arena</div>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>by NXLY</div>
                            </div>
                        </motion.div>

                        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            style={{ fontSize: 36, fontWeight: 900, color: 'white', lineHeight: 1.2, marginBottom: 14 }}>
                            পরীক্ষায় জিতো,<br />
                            <span style={{ background: 'linear-gradient(90deg,#4d6fff,#a78bfa,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                র‍্যাংকে উঠে আসো
                            </span>
                        </motion.h2>
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                            style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, marginBottom: 40, lineHeight: 1.6 }}>
                            বাংলাদেশের সেরা কম্পিটিটিভ পরীক্ষার প্ল্যাটফর্মে তোমাকে স্বাগতম।
                        </motion.p>

                        {/* Feature cards */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {FEATURES.map((f, i) => (
                                <motion.div key={f.label}
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.08 }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 16,
                                        background: activeFeature === i ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.025)',
                                        border: `1.5px solid ${activeFeature === i ? f.color + '44' : 'rgba(255,255,255,0.06)'}`,
                                        transition: 'all 0.4s ease',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => setActiveFeature(i)}>
                                    <div style={{ width: 38, height: 38, borderRadius: 10, background: f.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <f.icon size={18} style={{ color: f.color }} />
                                    </div>
                                    <div>
                                        <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{f.label}</div>
                                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>{f.desc}</div>
                                    </div>
                                    {activeFeature === i && (
                                        <motion.div layoutId="feature-dot"
                                            style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: f.color }} />
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        {/* Stats */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                            style={{ display: 'flex', gap: 24, marginTop: 36 }}>
                            {[['৫০,০০০+', 'শিক্ষার্থী'], ['২,০০০+', 'দৈনিক পরীক্ষা'], ['৯৮%', 'সন্তুষ্টি']].map(([v, l]) => (
                                <div key={l}>
                                    <div style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>{v}</div>
                                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{l}</div>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>

                {/* ── RIGHT PANEL: Login form ─────────────────────────────── */}
                <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: '32px 20px',
                    borderLeft: '1px solid rgba(255,255,255,0.05)',
                }}>
                    <motion.div
                        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        style={{ width: '100%', maxWidth: 380 }}>

                        {/* Mobile logo */}
                        <div className="flex lg:hidden" style={{ justifyContent: 'center', marginBottom: 28 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg,#4d6fff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Zap size={20} color="white" fill="white" />
                                </div>
                                <div style={{ fontWeight: 800, fontSize: 18, color: 'white' }}>Exam Arena</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: 28 }}>
                            <h1 style={{ color: 'white', fontWeight: 800, fontSize: 26, marginBottom: 6 }}>স্বাগতম!</h1>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>তোমার একাউন্টে লগইন করো</p>
                        </div>

                        {/* Status */}
                        {status && (
                            <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399', fontSize: 13, marginBottom: 16 }}>
                                {status}
                            </div>
                        )}

                        {/* Card */}
                        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 24, padding: '24px', backdropFilter: 'blur(20px)' }}>

                            {/* Google */}
                            <a href={route('auth.google')}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                    padding: '13px', borderRadius: 13,
                                    background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.13)',
                                    color: 'white', fontWeight: 600, fontSize: 14, textDecoration: 'none',
                                    marginBottom: 18, transition: 'background 0.2s',
                                }}>
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                Google দিয়ে লগইন
                            </a>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                                <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 12 }}>অথবা ইমেইলে</span>
                                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                            </div>

                            <form onSubmit={submit}>
                                {/* Email */}
                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 7, display: 'block' }}>ইমেইল</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                        <input
                                            type="email" value={data.email} autoFocus required
                                            onChange={e => setData('email', e.target.value)}
                                            placeholder="example@gmail.com"
                                            style={{
                                                width: '100%', boxSizing: 'border-box',
                                                padding: '13px 14px 13px 38px',
                                                background: 'rgba(255,255,255,0.06)',
                                                border: `1.5px solid ${errors.email ? 'rgba(248,113,113,0.6)' : 'rgba(255,255,255,0.12)'}`,
                                                borderRadius: 13, color: 'white', fontSize: 15, outline: 'none',
                                            }}
                                            onFocus={e => e.target.style.borderColor = '#4d6fff'}
                                            onBlur={e => e.target.style.borderColor = errors.email ? 'rgba(248,113,113,0.6)' : 'rgba(255,255,255,0.12)'}
                                        />
                                    </div>
                                    {errors.email && <p style={{ color: '#f87171', fontSize: 12, marginTop: 5 }}>{errors.email}</p>}
                                </div>

                                {/* Password */}
                                <div style={{ marginBottom: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                                        <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>পাসওয়ার্ড</label>
                                        {canResetPassword && (
                                            <Link href={route('password.request')} style={{ color: '#7c94ff', fontSize: 12, textDecoration: 'none' }}>
                                                ভুলে গেছো?
                                            </Link>
                                        )}
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                        <input
                                            type={showPass ? 'text' : 'password'} value={data.password} required
                                            onChange={e => setData('password', e.target.value)}
                                            placeholder="তোমার পাসওয়ার্ড"
                                            style={{
                                                width: '100%', boxSizing: 'border-box',
                                                padding: '13px 42px 13px 38px',
                                                background: 'rgba(255,255,255,0.06)',
                                                border: `1.5px solid ${errors.password ? 'rgba(248,113,113,0.6)' : 'rgba(255,255,255,0.12)'}`,
                                                borderRadius: 13, color: 'white', fontSize: 15, outline: 'none',
                                            }}
                                            onFocus={e => e.target.style.borderColor = '#4d6fff'}
                                            onBlur={e => e.target.style.borderColor = errors.password ? 'rgba(248,113,113,0.6)' : 'rgba(255,255,255,0.12)'}
                                        />
                                        <button type="button" onClick={() => setShowPass(p => !p)}
                                            style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 0 }}>
                                            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                    {errors.password && <p style={{ color: '#f87171', fontSize: 12, marginTop: 5 }}>{errors.password}</p>}
                                </div>

                                {/* Remember */}
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, cursor: 'pointer' }}>
                                    <input type="checkbox" checked={data.remember}
                                        onChange={e => setData('remember', e.target.checked)}
                                        style={{ width: 16, height: 16, accentColor: '#4d6fff', cursor: 'pointer' }} />
                                    <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>লগইন মনে রাখো</span>
                                </label>

                                {/* Submit */}
                                <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={processing}
                                    style={{
                                        width: '100%', padding: '14px', borderRadius: 13, border: 'none',
                                        background: processing ? 'rgba(77,111,255,0.4)' : 'linear-gradient(135deg,#4d6fff,#7c3aed)',
                                        color: 'white', fontWeight: 700, fontSize: 16,
                                        cursor: processing ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        boxShadow: processing ? 'none' : '0 6px 24px rgba(77,111,255,0.38)',
                                        transition: 'all 0.2s',
                                    }}>
                                    {processing ? (
                                        <svg className="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24">
                                            <circle opacity=".25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path opacity=".75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                                        </svg>
                                    ) : (
                                        <><Zap size={17} fill="white" /> লগইন করো</>
                                    )}
                                </motion.button>
                            </form>
                        </div>

                        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 14, marginTop: 20 }}>
                            একাউন্ট নেই?{' '}
                            <Link href={route('register')} style={{ color: '#7c94ff', fontWeight: 600, textDecoration: 'none' }}>
                                বিনামূল্যে নিবন্ধন করো →
                            </Link>
                        </p>
                    </motion.div>
                </div>
            </div>
        </>
    );
}
