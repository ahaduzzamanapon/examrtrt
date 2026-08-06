import { useState } from 'react';
import MobileLayout from '@/Layouts/MobileLayout';
import { motion } from 'framer-motion';
import { Link, usePage } from '@inertiajs/react';
import {
    Zap, Sword, BookOpen, Brain, Trophy, TrendingUp,
    ChevronRight, Clock, Star, Flame, FileText,
} from 'lucide-react';
import ProfileSetupModal from '@/Components/ProfileSetupModal';

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
};
const item = {
    hidden: { opacity: 0, y: 20 },
    show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } },
};

const quickActions = [
    { icon: Zap,      label: 'লাইভ কনটেস্ট', href: 'exams.index',      color: '#4d6fff', bg: 'rgba(77,111,255,0.18)'  },
    { icon: FileText, label: 'মডেল টেস্ট',   href: 'model-test.index', color: '#a78bfa', bg: 'rgba(167,139,250,0.18)' },
    { icon: Sword,    label: '১v১ ব্যাটেল',   href: 'battle.index',     color: '#f59e0b', bg: 'rgba(245,158,11,0.18)'  },
    { icon: BookOpen, label: 'প্র্যাকটিস',     href: 'practice.index',   color: '#10b981', bg: 'rgba(16,185,129,0.18)'  },
    { icon: Brain,    label: 'সারভাইভাল',      href: 'survival.index',   color: '#ef4444', bg: 'rgba(239,68,68,0.18)'   },
];

export default function Dashboard({ auth, upcomingExams = [] }) {
    const user = auth?.user ?? usePage().props.auth?.user;

    // Show setup modal if exam_goal missing OR hsc/ssc without stream
    const goals = Array.isArray(user?.exam_goal) ? user.exam_goal : [];
    const firstGoal = goals[0] ?? null;
    const needsStream = firstGoal === 'hsc' || firstGoal === 'ssc';
    const needsSetup = !firstGoal || (needsStream && !user?.stream);
    const [showSetup, setShowSetup] = useState(needsSetup);

    return (
        <MobileLayout title="হোম">
            {showSetup && (
                <ProfileSetupModal onDone={() => setShowSetup(false)} />
            )}
            <div className="px-4 space-y-5">

                {/* ── Hero greeting ─────────────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
                    <p className="text-white/50 text-sm">স্বাগতম,</p>
                    <h1 className="text-2xl font-bold text-white mt-0.5">{user.name.split(' ')[0]} 👋</h1>
                    {user.streak_count > 0 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.2 }}
                            className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                            style={{ background: 'rgba(245,158,11,0.18)', border: '1px solid rgba(245,158,11,0.35)', color: '#fcd34d' }}
                        >
                            <Flame size={13} />
                            {user.streak_count} দিনের ধারাবাহিকতা!
                        </motion.div>
                    )}
                </motion.div>

                {/* ── Stats strip ───────────────────────────────────────── */}
                <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-3 gap-2">
                    {[
                        { label: 'মোট পয়েন্ট', value: parseFloat(user.total_points).toFixed(0),       icon: Star,       color: '#fcd34d' },
                        { label: 'কনটেস্ট পাস', value: user.free_contest_passes,                       icon: Zap,        color: '#93b4ff' },
                        { label: 'ওয়ালেট',      value: `৳${parseFloat(user.wallet_balance).toFixed(0)}`, icon: TrendingUp, color: '#6ee7b7' },
                    ].map((s) => (
                        <motion.div key={s.label} variants={item} className="card-glass-sm p-3 flex flex-col items-center text-center">
                            <s.icon size={18} style={{ color: s.color }} className="mb-1.5" />
                            <p className="text-white font-bold text-base">{s.value}</p>
                            <p className="text-white/40 text-[10px] mt-0.5">{s.label}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ── Quick Actions ──────────────────────────────────────── */}
                <motion.section variants={container} initial="hidden" animate="show">
                    <p className="section-title">দ্রুত শুরু করুন</p>
                    <div className="grid grid-cols-2 gap-3">
                        {quickActions.map((action) => (
                            <motion.div key={action.label} variants={item}>
                                <Link href={route(action.href)}
                                    className="card-glass p-4 flex flex-col gap-3 active:scale-95 transition-transform block">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: action.bg }}>
                                        <action.icon size={20} style={{ color: action.color }} />
                                    </div>
                                    <p className="text-white text-sm font-semibold">{action.label}</p>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* ── Upcoming Exams ─────────────────────────────────────── */}
                {upcomingExams.length > 0 && (
                    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <div className="flex items-center justify-between mb-3">
                            <p className="section-title mb-0">আসন্ন কনটেস্ট</p>
                            <Link href={route('exams.index')} className="text-xs flex items-center gap-1" style={{ color: '#93b4ff' }}>
                                সব দেখুন <ChevronRight size={14} />
                            </Link>
                        </div>
                        <div className="space-y-2">
                            {upcomingExams.slice(0, 3).map((exam) => (
                                <Link key={exam.id} href={route('exams.index')}
                                    className="card-glass-sm p-4 flex items-center gap-3 active:scale-[0.98] transition-transform block">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: exam.entry_fee > 0 ? 'rgba(245,158,11,0.18)' : 'rgba(16,185,129,0.18)' }}>
                                        <Zap size={18} style={{ color: exam.entry_fee > 0 ? '#f59e0b' : '#10b981' }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm font-semibold truncate">{exam.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="flex items-center gap-1 text-white/40 text-xs">
                                                <Clock size={10} />
                                                {new Date(exam.scheduled_at).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {exam.entry_fee > 0 ? <span className="badge-gold">৳{exam.entry_fee}</span> : <span className="badge-green">ফ্রি</span>}
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-white/30 flex-shrink-0" />
                                </Link>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* ── Leaderboard teaser ─────────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Link href={route('leaderboard.index')}
                        className="card-glass p-4 flex items-center gap-4 active:scale-[0.98] transition-transform block"
                        style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(77,111,255,0.08))' }}>
                        <Trophy size={32} style={{ color: '#f59e0b' }} className="flex-shrink-0 animate-float" />
                        <div className="flex-1">
                            <p className="text-white font-semibold text-sm">গ্লোবাল লিডারবোর্ড</p>
                            <p className="text-white/50 text-xs mt-0.5">তোমার র‍্যাংক দেখো সবার মধ্যে</p>
                        </div>
                        <ChevronRight size={18} className="text-white/30" />
                    </Link>
                </motion.div>

                <div className="h-4" />
            </div>
        </MobileLayout>
    );
}
