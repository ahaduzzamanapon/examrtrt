import { Link, Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Zap, Sword, BookOpen, Brain, Trophy, Coins,
    Star, ChevronRight, CheckCircle, Users, TrendingUp,
    Gift, Tv, Clock, Shield, ArrowRight, Play,
} from 'lucide-react';

// ── Animation helpers ──────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const cardAnim = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
};

// ── Data ───────────────────────────────────────────────────────────────────────
const features = [
    {
        icon: Zap, color: '#4d6fff', bg: 'rgba(77,111,255,0.15)',
        title: 'লাইভ কনটেস্ট',
        desc: 'শত শত প্রতিযোগীর সাথে একই সময়ে পরীক্ষা দাও। BCS, HSC, SSC — সব ক্যাটাগরি।',
        badge: 'সবচেয়ে জনপ্রিয়',
    },
    {
        icon: Sword, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',
        title: '১ vs ১ ব্যাটেল',
        desc: 'যেকোনো অনলাইন ইউজারকে চ্যালেঞ্জ করো। ১০ প্রশ্নে নিজের দক্ষতা প্রমাণ করো।',
        badge: 'রোমাঞ্চকর',
    },
    {
        icon: BookOpen, color: '#10b981', bg: 'rgba(16,185,129,0.15)',
        title: 'প্র্যাকটিস টেস্ট',
        desc: 'AI-জেনারেটেড প্রশ্নে যখন খুশি প্র্যাকটিস করো। ভুল হলে ব্যাখ্যা পড়ো।',
        badge: 'টোকেন দিয়ে',
    },
    {
        icon: Brain, color: '#a78bfa', bg: 'rgba(167,139,250,0.15)',
        title: 'সারভাইভাল মোড',
        desc: 'একটি ভুল উত্তর = গেম ওভার! কতদূর যেতে পারো? দৈনিক বিজয়ী পাবে পুরস্কার।',
        badge: 'হাই রিস্ক',
    },
    {
        icon: Coins, color: '#fbbf24', bg: 'rgba(251,191,36,0.15)',
        title: 'টোকেন সিস্টেম',
        desc: 'প্র্যাকটিস ও মডেল টেস্টে টোকেন খরচ হয়। প্রতিদিন বিনামূল্যে টোকেন পাও।',
        badge: 'ফ্রি টোকেন',
    },
    {
        icon: Trophy, color: '#ef4444', bg: 'rgba(239,68,68,0.15)',
        title: 'গ্লোবাল লিডারবোর্ড',
        desc: 'সেরা পরীক্ষার্থীদের র‍্যাংকিং। পয়েন্ট অর্জন করো, শীর্ষে উঠে আসো।',
        badge: 'সাপ্তাহিক রিসেট',
    },
];

const earnMethods = [
    { icon: Gift,       color: '#10b981', title: 'দৈনিক বোনাস',    desc: 'প্রতিদিন লগইন করলে ১০+ টোকেন বিনামূল্যে',    amount: '+১০' },
    { icon: Tv,         color: '#4d6fff', title: 'বিজ্ঞাপন দেখো', desc: 'একটি ছোট্ট বিজ্ঞাপন দেখলেই ৫ টোকেন পাবে', amount: '+৫'  },
    { icon: Users,      color: '#f59e0b', title: 'রেফারেল বোনাস',  desc: 'বন্ধুকে রেফার করো, পাও ৫০ টোকেন',              amount: '+৫০' },
    { icon: Star,       color: '#a78bfa', title: 'স্ট্রিক বোনাস',  desc: '৭ দিন টানা পড়লে বিশেষ বোনাস',                amount: '+৩০' },
    { icon: TrendingUp, color: '#fbbf24', title: 'টোকেন কিনো',     desc: 'ওয়ালেটের টাকা দিয়ে যেকোনো সময় কিনো',        amount: 'টাকায়' },
    { icon: Zap,        color: '#ef4444', title: 'কনটেস্ট জিতো',  desc: 'লাইভ কনটেস্টে জিতে টোকেন + নগদ পুরস্কার',   amount: '🏆' },
];

const stats = [
    { value: '৫০,০০০+', label: 'নিবন্ধিত শিক্ষার্থী' },
    { value: '২,০০০+',  label: 'দৈনিক পরীক্ষা' },
    { value: '১,০০,০০০+', label: 'প্রশ্নের ব্যাংক' },
    { value: '৯৮%',     label: 'সন্তুষ্ট ব্যবহারকারী' },
];

// ── Component ──────────────────────────────────────────────────────────────────
export default function Welcome() {
    return (
        <>
            <Head title="NXLY Exam Arena — বাংলাদেশের সেরা পরীক্ষার প্ল্যাটফর্ম" />

            <div className="min-h-screen overflow-x-hidden" style={{
                background: 'linear-gradient(135deg, #05071a 0%, #0a0e23 40%, #0f1a3e 100%)',
                color: '#e2e8f0',
                fontFamily: "'Hind Siliguri', 'Inter', sans-serif",
            }}>

                {/* ── NAV ─────────────────────────────────────────────────── */}
                <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3"
                    style={{ background: 'rgba(5,7,26,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm"
                            style={{ background: 'linear-gradient(135deg, #4d6fff, #7c3aed)' }}>N</div>
                        <span className="font-bold text-white text-sm">NXLY <span style={{ background: 'linear-gradient(90deg,#4d6fff,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Arena</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={route('login')}
                            className="px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white transition-colors">
                            লগইন
                        </Link>
                        <Link href={route('register')}
                            className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                            style={{ background: 'linear-gradient(135deg, #4d6fff, #7c3aed)' }}>
                            শুরু করো
                        </Link>
                    </div>
                </nav>

                {/* ── HERO ────────────────────────────────────────────────── */}
                <section className="relative pt-28 pb-16 px-5 text-center overflow-hidden">
                    {/* Glow orbs */}
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20 pointer-events-none"
                        style={{ background: 'radial-gradient(circle, #4d6fff 0%, transparent 70%)', filter: 'blur(60px)' }} />
                    <div className="absolute top-40 right-0 w-64 h-64 rounded-full opacity-15 pointer-events-none"
                        style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', filter: 'blur(50px)' }} />

                    <motion.div {...fadeUp(0)}>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
                            style={{ background: 'rgba(77,111,255,0.18)', border: '1px solid rgba(77,111,255,0.35)', color: '#93b4ff' }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            বাংলাদেশের #১ কম্পিটিটিভ পরীক্ষার প্ল্যাটফর্ম
                        </span>
                    </motion.div>

                    <motion.h1 {...fadeUp(0.1)} className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
                        পরীক্ষায় <span style={{ background: 'linear-gradient(90deg,#4d6fff,#a78bfa,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>জিতো</span>,<br />
                        র‍্যাংকে <span style={{ background: 'linear-gradient(90deg,#10b981,#4d6fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>উঠে আসো</span>
                    </motion.h1>

                    <motion.p {...fadeUp(0.2)} className="text-white/60 text-base max-w-sm mx-auto mb-8 leading-relaxed">
                        লাইভ কনটেস্ট, ১-অন-১ ব্যাটেল, AI প্র্যাকটিস এবং টোকেন রিওয়ার্ড — সব একটাই অ্যাপে।
                    </motion.p>

                    <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href={route('register')}
                            className="flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-white font-bold text-base"
                            style={{ background: 'linear-gradient(135deg, #4d6fff, #7c3aed)', boxShadow: '0 8px 32px rgba(77,111,255,0.4)' }}>
                            <Play size={18} fill="white" />
                            বিনামূল্যে শুরু করো
                        </Link>
                        <Link href={route('login')}
                            className="flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold text-base text-white/80"
                            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                            লগইন করো <ChevronRight size={18} />
                        </Link>
                    </motion.div>

                    {/* Stats strip */}
                    <motion.div {...fadeUp(0.4)} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12 max-w-xl mx-auto">
                        {stats.map(s => (
                            <div key={s.label} className="p-3 rounded-2xl text-center"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <p className="text-xl font-black text-white">{s.value}</p>
                                <p className="text-white/50 text-xs mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </motion.div>
                </section>

                {/* ── FEATURES ─────────────────────────────────────────────── */}
                <section className="px-5 py-14">
                    <motion.div {...fadeUp()} className="text-center mb-8">
                        <h2 className="text-2xl font-black text-white">কী কী করতে পারবে?</h2>
                        <p className="text-white/50 text-sm mt-2">একটি প্ল্যাটফর্মে সব ধরনের পরীক্ষার প্রস্তুতি</p>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        {features.map(f => (
                            <motion.div key={f.title} variants={cardAnim}
                                className="relative p-5 rounded-2xl"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                {/* Badge */}
                                <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                    style={{ background: f.bg, color: f.color }}>
                                    {f.badge}
                                </span>
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: f.bg }}>
                                    <f.icon size={22} style={{ color: f.color }} />
                                </div>
                                <h3 className="text-white font-bold text-base mb-1">{f.title}</h3>
                                <p className="text-white/55 text-sm leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {/* ── TOKEN SYSTEM ─────────────────────────────────────────── */}
                <section className="px-5 py-14" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <motion.div {...fadeUp()} className="text-center mb-8">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
                            style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
                            <Coins size={12} /> টোকেন সিস্টেম
                        </span>
                        <h2 className="text-2xl font-black text-white">টোকেন কীভাবে পাবে?</h2>
                        <p className="text-white/50 text-sm mt-2">৬টি উপায়ে প্রতিদিন টোকেন অর্জন করো — বিনামূল্যে!</p>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                        {earnMethods.map(m => (
                            <motion.div key={m.title} variants={cardAnim}
                                className="flex items-center gap-4 p-4 rounded-2xl"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: m.color + '22' }}>
                                    <m.icon size={22} style={{ color: m.color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="text-white font-semibold text-sm">{m.title}</p>
                                        <span className="font-black text-sm" style={{ color: m.color }}>{m.amount}</span>
                                    </div>
                                    <p className="text-white/50 text-xs mt-0.5 leading-snug">{m.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Token use cases */}
                    <motion.div {...fadeUp(0.2)} className="mt-8 p-5 rounded-2xl max-w-2xl mx-auto"
                        style={{ background: 'linear-gradient(135deg, rgba(77,111,255,0.12), rgba(124,58,237,0.08))', border: '1px solid rgba(77,111,255,0.2)' }}>
                        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                            <Zap size={16} style={{ color: '#4d6fff' }} /> টোকেন দিয়ে কী করবে?
                        </h3>
                        <div className="space-y-2">
                            {[
                                ['প্র্যাকটিস টেস্ট দাও', '৫ টোকেন / টেস্ট'],
                                ['মডেল টেস্ট দাও', '২০ টোকেন / টেস্ট'],
                                ['লাইভ কনটেস্ট (ফ্রি)', '০ টোকেন — পুরোপুরি বিনামূল্যে'],
                            ].map(([label, cost]) => (
                                <div key={label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-white/70">
                                        <CheckCircle size={14} style={{ color: '#10b981' }} />
                                        {label}
                                    </div>
                                    <span className="text-xs font-semibold" style={{ color: '#fbbf24' }}>{cost}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-white/40 text-xs mt-3">* লাইভ কনটেস্টে টাকা লাগে, টোকেন নয়। টোকেন শুধু প্র্যাকটিসে ব্যবহার হয়।</p>
                    </motion.div>
                </section>

                {/* ── ANTI-CHEAT GUARANTEE ─────────────────────────────────── */}
                <section className="px-5 py-14">
                    <motion.div {...fadeUp()} className="max-w-2xl mx-auto p-6 rounded-3xl text-center"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Shield size={36} className="mx-auto mb-3" style={{ color: '#10b981' }} />
                        <h2 className="text-xl font-black text-white mb-2">সম্পূর্ণ সুরক্ষিত পরীক্ষার পরিবেশ</h2>
                        <p className="text-white/55 text-sm leading-relaxed mb-5">
                            ডাইনামিক ওয়াটারমার্ক, ট্যাব-সুইচ ডিটেকশন, কপি-পেস্ট বন্ধ — প্রতিটি পরীক্ষা ১০০% সৎ ও নিরাপদ।
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                ['🚫', 'কপি-পেস্ট বন্ধ'],
                                ['👁️', 'ট্যাব মনিটর'],
                                ['🔒', 'DevTools বন্ধ'],
                            ].map(([emoji, label]) => (
                                <div key={label} className="p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                                    <p className="text-xl mb-1">{emoji}</p>
                                    <p className="text-xs text-white/60">{label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </section>

                {/* ── CTA ─────────────────────────────────────────────────── */}
                <section className="px-5 py-16 text-center">
                    <motion.div {...fadeUp()}>
                        <h2 className="text-3xl font-black text-white mb-3">
                            আজই শুরু করো —<br />
                            <span style={{ background: 'linear-gradient(90deg,#4d6fff,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                সম্পূর্ণ বিনামূল্যে
                            </span>
                        </h2>
                        <p className="text-white/50 text-sm mb-8">নিবন্ধন করলেই পাবে ৫০ বোনাস টোকেন 🎁</p>
                        <Link href={route('register')}
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-base"
                            style={{ background: 'linear-gradient(135deg, #4d6fff, #7c3aed)', boxShadow: '0 8px 40px rgba(77,111,255,0.45)' }}>
                            ফ্রি একাউন্ট খোলো
                            <ArrowRight size={18} />
                        </Link>
                    </motion.div>
                </section>

                {/* ── FOOTER ───────────────────────────────────────────────── */}
                <footer className="px-5 py-8 text-center border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center font-black text-white text-xs"
                            style={{ background: 'linear-gradient(135deg, #4d6fff, #7c3aed)' }}>N</div>
                        <span className="font-bold text-white text-sm">NXLY Exam Arena</span>
                    </div>
                    <p className="text-white/30 text-xs">© ২০২৬ NXLY. সর্বস্বত্ব সংরক্ষিত।</p>
                    <p className="text-white/20 text-xs mt-1">examarena.nxly.online</p>
                </footer>

            </div>
        </>
    );
}
