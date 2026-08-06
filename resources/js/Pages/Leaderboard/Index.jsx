import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Star, Flame } from 'lucide-react';
import MobileLayout from '@/Layouts/MobileLayout';

export default function LeaderboardIndex({ leaders = [], type = 'global' }) {
    const [tab, setTab] = useState(type);

    const changeTab = (newTab) => {
        setTab(newTab);
        router.visit(route('leaderboard.index', { type: newTab }), { preserveState: true });
    };

    // Reorder top 3 so order is [2nd, 1st, 3rd] for classic podium alignment
    const first  = leaders[0] || null;
    const second = leaders[1] || null;
    const third  = leaders[2] || null;
    const rest   = leaders.slice(3);

    const formatVal = (item) => {
        if (item.score !== undefined && item.score !== null) {
            return `${parseFloat(item.score).toFixed(0)} পয়েন্ট`;
        }
        if (item.total_score !== undefined && item.total_score !== null) {
            return `${parseFloat(item.total_score).toFixed(0)} পয়েন্ট`;
        }
        return `৳${parseFloat(item.wallet_balance || 0).toFixed(0)}`;
    };

    return (
        <MobileLayout title="লিডারবোর্ড">
            <Head title="লিডারবোর্ড — ExamArena" />

            <div style={{ padding: '16px', maxWidth: 520, margin: '0 auto', paddingBottom: 80, boxSizing: 'border-box' }}>

                {/* Tab Switcher */}
                <div style={{
                    display: 'flex', gap: 6, padding: 4, borderRadius: 16,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                    marginBottom: 20,
                }}>
                    <button
                        onClick={() => changeTab('global')}
                        style={{
                            flex: 1, padding: '10px 8px', borderRadius: 12, border: 'none',
                            background: tab === 'global' ? 'linear-gradient(135deg,#4d6fff,#7c3aed)' : 'transparent',
                            color: tab === 'global' ? 'white' : 'rgba(255,255,255,0.5)',
                            fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                        }}
                    >
                        🌐 গ্লোবাল র‍্যাংকিং
                    </button>
                    <button
                        onClick={() => changeTab('contest')}
                        style={{
                            flex: 1, padding: '10px 8px', borderRadius: 12, border: 'none',
                            background: tab === 'contest' ? 'linear-gradient(135deg,#4d6fff,#7c3aed)' : 'transparent',
                            color: tab === 'contest' ? 'white' : 'rgba(255,255,255,0.5)',
                            fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                        }}
                    >
                        🏆 কনটেস্ট টপার
                    </button>
                </div>

                {/* Top 3 Podium */}
                {leaders.length > 0 && (
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1.15fr 1fr', gap: 8, alignItems: 'end',
                        marginBottom: 24, paddingTop: 16,
                    }}>
                        {/* 2nd Place */}
                        {second ? (
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                                style={{ textAlign: 'center', minWidth: 0 }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: '50%', border: '2px solid #94a3b8',
                                    background: 'rgba(148,163,184,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 900, color: 'white', fontSize: 18, margin: '0 auto 6px', position: 'relative'
                                }}>
                                    🥈
                                </div>
                                <div style={{ color: 'white', fontWeight: 700, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {second.user?.name || second.name || 'User'}
                                </div>
                                <div style={{ color: '#94a3b8', fontWeight: 800, fontSize: 11, marginTop: 2 }}>
                                    {formatVal(second)}
                                </div>
                            </motion.div>
                        ) : <div />}

                        {/* 1st Place */}
                        {first ? (
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                                style={{ textAlign: 'center', minWidth: 0 }}>
                                <div style={{
                                    width: 60, height: 60, borderRadius: '50%', border: '2px solid #fbbf24',
                                    background: 'rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 900, color: 'white', fontSize: 24, margin: '0 auto 6px',
                                    boxShadow: '0 0 20px rgba(245,158,11,0.4)', position: 'relative'
                                }}>
                                    👑
                                </div>
                                <div style={{ color: '#fcd34d', fontWeight: 800, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {first.user?.name || first.name || 'User'}
                                </div>
                                <div style={{ color: '#fbbf24', fontWeight: 900, fontSize: 12, marginTop: 2 }}>
                                    {formatVal(first)}
                                </div>
                            </motion.div>
                        ) : <div />}

                        {/* 3rd Place */}
                        {third ? (
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                                style={{ textAlign: 'center', minWidth: 0 }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: '50%', border: '2px solid #b45309',
                                    background: 'rgba(180,83,9,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 900, color: 'white', fontSize: 18, margin: '0 auto 6px', position: 'relative'
                                }}>
                                    🥉
                                </div>
                                <div style={{ color: 'white', fontWeight: 700, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {third.user?.name || third.name || 'User'}
                                </div>
                                <div style={{ color: '#d97706', fontWeight: 800, fontSize: 11, marginTop: 2 }}>
                                    {formatVal(third)}
                                </div>
                            </motion.div>
                        ) : <div />}
                    </div>
                )}

                {/* Leaderboard List */}
                {leaders.length === 0 ? (
                    <div style={{
                        padding: '40px 20px', textAlign: 'center', borderRadius: 18,
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                    }}>
                        <div style={{ fontSize: 36, marginBottom: 8 }}>🏆</div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>বর্তমানে কোনো র‍্যাঙ্কিং ডেটা নেই</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {rest.map((item, i) => {
                            const rank = i + 4;
                            const name = item.user?.name || item.name || 'User';
                            return (
                                <div key={item.id || i} style={{
                                    padding: '12px 14px', borderRadius: 14,
                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                                    display: 'flex', alignItems: 'center', gap: 10, minWidth: 0,
                                }}>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: 12, width: 28, flexShrink: 0 }}>
                                        #{rank}
                                    </div>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#4d6fff,#7c3aed)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                                        fontWeight: 800, fontSize: 12, flexShrink: 0,
                                    }}>
                                        {name[0]?.toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1, color: 'white', fontWeight: 600, fontSize: 13, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {name}
                                    </div>
                                    <div style={{ color: '#93b4ff', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                                        {formatVal(item)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

            </div>
        </MobileLayout>
    );
}
