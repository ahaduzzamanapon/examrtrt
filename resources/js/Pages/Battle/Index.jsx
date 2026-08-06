import { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Trophy, Zap, Plus, Users, Shield, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import MobileLayout from '@/Layouts/MobileLayout';

const STAKES = [
    { value: 0,  label: 'ফ্রি প্র্যাকটিস', badge: 'FREE' },
    { value: 10, label: '১০ টোকেন স্টেক', badge: '⚡১০' },
    { value: 20, label: '২০ টোকেন স্টেক', badge: '⚡২০' },
    { value: 50, label: '৫০ টোকেন স্টেক', badge: '⚡৫০' },
];

export default function BattleIndex({ invites = [], mySessions = [], tokenBalance = 0 }) {
    const { errors, auth } = usePage().props;
    const [showCreate, setShowCreate] = useState(false);
    const [selectedStake, setSelectedStake] = useState(0);

    const form = useForm({
        stake_amount: 0,
    });

    const handleCreateChallenge = (e) => {
        e.preventDefault();
        form.setData('stake_amount', selectedStake);
        form.post(route('battle.create-invite'));
    };

    const handleCancel = (inviteId) => {
        router.post(route('battle.cancel', inviteId));
    };

    const handleAccept = (inviteId) => {
        router.post(route('battle.accept', inviteId));
    };

    return (
        <MobileLayout title="১v১ ব্যাটেল">
            <Head title="১v১ লাইভ ব্যাটেল — ExamArena" />

            <div style={{ padding: '16px', maxWidth: 520, margin: '0 auto', paddingBottom: 80 }}>

                {/* Banner Card */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(239,68,68,0.18))',
                    border: '1px solid rgba(245,158,11,0.3)', borderRadius: 22, padding: '22px 20px',
                    marginBottom: 20, boxShadow: '0 10px 30px rgba(245,158,11,0.15)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                                width: 46, height: 46, borderRadius: '50%',
                                background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 14px rgba(245,158,11,0.4)',
                            }}>
                                <Sword size={22} color="white" />
                            </div>
                            <div>
                                <h2 style={{ color: 'white', fontWeight: 900, fontSize: 20, margin: 0 }}>
                                    ১v১ অনলাইন রিয়েলটাইম ব্যাটেল
                                </h2>
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: 0 }}>
                                    বন্ধুদের সাথে প্রতিযোগিতা করো এবং সেরা হও!
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: 14, marginTop: 14,
                    }}>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>আপনার টোকেন ব্যালেন্স:</div>
                        <div style={{ color: '#fbbf24', fontWeight: 900, fontSize: 16 }}>⚡{tokenBalance}</div>
                    </div>

                    <button
                        onClick={() => setShowCreate(true)}
                        style={{
                            width: '100%', marginTop: 14, padding: '14px', borderRadius: 14, border: 'none',
                            background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white',
                            fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            boxShadow: '0 4px 16px rgba(245,158,11,0.35)',
                        }}
                    >
                        <Plus size={18} /> নতুন ১v১ চ্যালেঞ্জ পোস্ট করো
                    </button>
                </div>

                {errors.stake && (
                    <div style={{ padding: '12px 14px', borderRadius: 12, marginBottom: 16, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 13 }}>
                        ⚠️ {errors.stake}
                    </div>
                )}
                {errors.msg && (
                    <div style={{ padding: '12px 14px', borderRadius: 12, marginBottom: 16, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 13 }}>
                        ⚠️ {errors.msg}
                    </div>
                )}

                {/* Open Challenges List */}
                <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ color: 'white', fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Users size={18} color="#f59e0b" /> ওপেন চ্যালেঞ্জসমূহ
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700 }}>
                        {invites.length} টি সক্রিয়
                    </span>
                </div>

                {invites.length === 0 ? (
                    <div style={{
                        padding: '36px 20px', textAlign: 'center', borderRadius: 18,
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                        marginBottom: 24,
                    }}>
                        <div style={{ fontSize: 36, marginBottom: 8 }}>⚔️</div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>বর্তমানে কোনো ওপেন চ্যালেঞ্জ নেই</div>
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 4 }}>
                            উপরে বাটনে ক্লিক করে আপনি প্রথম চ্যালেঞ্জটি তৈরি করুন!
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                        {invites.map((inv) => {
                            const isMine = inv.sender_id === auth?.user?.id;
                            return (
                                <div
                                    key={inv.id}
                                    style={{
                                        padding: '16px', borderRadius: 16,
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{
                                                padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800,
                                                background: inv.stake_amount > 0 ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.15)',
                                                color: inv.stake_amount > 0 ? '#fbbf24' : '#34d399',
                                            }}>
                                                {inv.stake_amount > 0 ? `⚡${inv.stake_amount} স্টেক` : 'FREE'}
                                            </span>
                                            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
                                                {new Date(inv.created_at).toLocaleTimeString('bn-BD', { timeStyle: 'short' })}
                                            </span>
                                        </div>
                                        <div style={{ color: 'white', fontWeight: 700, fontSize: 14, marginTop: 4 }}>
                                            {inv.sender?.name} এর চ্যালেঞ্জ ⚔️
                                        </div>
                                    </div>

                                    {isMine ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Link href={route('battle.room', inv.id)}
                                                style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(77,111,255,0.2)', color: '#93b4ff', fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>
                                                রুমে যাও →
                                            </Link>
                                            <button
                                                onClick={() => handleCancel(inv.id)}
                                                style={{ padding: '8px 10px', borderRadius: 10, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
                                                বাতিল ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleAccept(inv.id)}
                                            style={{
                                                padding: '9px 16px', borderRadius: 12, border: 'none',
                                                background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                                                color: 'white', fontWeight: 800, fontSize: 13, cursor: 'pointer',
                                            }}
                                        >
                                            চ্যালেঞ্জ নাও ⚔️
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

            </div>

            {/* ── CREATE CHALLENGE MODAL ─────────────────────────────────────── */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.75)',
                            backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            style={{
                                width: '100%', maxWidth: 420, borderRadius: 24, padding: 24,
                                background: 'linear-gradient(135deg,rgba(15,20,50,0.98),rgba(25,15,40,0.98))',
                                border: '1px solid rgba(245,158,11,0.3)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                                <div style={{ color: 'white', fontWeight: 900, fontSize: 18 }}>
                                    নতুন ১v১ চ্যালেঞ্জ তৈরি করো
                                </div>
                                <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 20 }}>✕</button>
                            </div>

                            <form onSubmit={handleCreateChallenge} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                                        স্টেক পরিমাণ নির্বাচন করুন
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                                        {STAKES.map((s) => (
                                            <button
                                                key={s.value}
                                                type="button"
                                                onClick={() => setSelectedStake(s.value)}
                                                style={{
                                                    padding: '12px', borderRadius: 12, border: '1px solid', cursor: 'pointer',
                                                    background: selectedStake === s.value ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.04)',
                                                    borderColor: selectedStake === s.value ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                                                    color: selectedStake === s.value ? '#fbbf24' : 'rgba(255,255,255,0.7)',
                                                    fontWeight: 800, fontSize: 13, textAlign: 'center',
                                                }}
                                            >
                                                <div style={{ fontSize: 16 }}>{s.badge}</div>
                                                <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{s.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    type="submit"
                                    disabled={form.processing}
                                    style={{
                                        padding: '14px', borderRadius: 14, border: 'none',
                                        background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                                        color: 'white', fontWeight: 800, fontSize: 15, cursor: 'pointer',
                                        marginTop: 8, boxShadow: '0 6px 20px rgba(245,158,11,0.35)',
                                    }}
                                >
                                    {form.processing ? 'তৈরি হচ্ছে...' : '⚔️ চ্যালেঞ্জ হোস্ট করো'}
                                </motion.button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </MobileLayout>
    );
}
