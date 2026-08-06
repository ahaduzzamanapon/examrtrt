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

    const top3 = leaders.slice(0, 3);
    const rest = leaders.slice(3);

    return (
        <MobileLayout title="লিডারবোর্ড">
            <Head title="লিডারবোর্ড — ExamArena" />

            <div style={{ padding: '16px', maxWidth: 520, margin: '0 auto', paddingBottom: 80 }}>

                {/* Tab Switcher */}
                <div style={{
                    display: 'flex', gap: 6, padding: 4, borderRadius: 16,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                    marginBottom: 20,
                }}>
                    <button
                        onClick={() => changeTab('global')}
                        style={{
                            flex: 1, padding: '10px', borderRadius: 12, border: 'none',
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
                            flex: 1, padding: '10px', borderRadius: 12, border: 'none',
                            background: tab === 'contest' ? 'linear-gradient(135deg,#4d6fff,#7c3aed)' : 'transparent',
                            color: tab === 'contest' ? 'white' : 'rgba(255,255,255,0.5)',
                            fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                        }}
                    >
                        🏆 কনটেস্ট টপার
                    </button>
                </div>

                {/* Top 3 Podium */}
                {top3.length > 0 && (
                    <div style={{
                        display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12,
                        marginBottom: 28, paddingTop: 20,
                    }}>
                        {/* 2nd Place */}
                        {top3[1] && (
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                                style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                    width: 52, height: 52, borderRadius: '50%', border: '2px solid #94a3b8',
                                    background: 'rgba(148,163,184,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 900, color: 'white', fontSize: 18, marginBottom: 8, position: 'relative'
                                }}>
                                    🥈
                                </div>
                                <div style={{ color: 'white', fontWeight: 700, fontSize: 12, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {top3[1].user?.name || top3[1].name}
                                </div>
                                <div style={{ color: '#94a3b8', fontWeight: 800, fontSize: 11, marginTop: 2 }}>
                                    {top3[1].score ?? `৳${top3[1].wallet_balance}`}
                                </div>
                            </motion.div>
                        )}

                        {/* 1st Place */}
                        {top3[0] && (
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                                style={{ flex: 1.2, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                    width: 64, height: 64, borderRadius: '50%', border: '2px solid #fbbf24',
                                    background: 'rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 900, color: 'white', fontSize: 24, marginBottom: 8,
                                    boxShadow: '0 0 20px rgba(245,158,11,0.4)', position: 'relative'
                                }}>
                                    👑
                                </div>
                                <div style={{ color: '#fcd34d', fontWeight: 800, fontSize: 14, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {top3[0].user?.name || top3[0].name}
                                </div>
                                <div style={{ color: '#fbbf24', fontWeight: 900, fontSize: 13, marginTop: 2 }}>
                                    {top3[0].score ?? `৳${top3[0].wallet_balance}`}
                                </div>
                            </motion.div>
                        )}

                        {/* 3rd Place */}
                        {top3[2] && (
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                                style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                    width: 52, height: 52, borderRadius: '50%', border: '2px solid #b45309',
                                    background: 'rgba(180,83,9,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 900, color: 'white', fontSize: 18, marginBottom: 8, position: 'relative'
                                }}>
                                    🥉
                                </div>
                                <div style={{ color: 'white', fontWeight: 700, fontSize: 12, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {top3[2].user?.name || top3[2].name}
                                </div>
                                <div style={{ color: '#d97706', fontWeight: 800, fontSize: 11, marginTop: 2 }}>
                                    {top3[2].score ?? `৳${top3[2].wallet_balance}`}
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}

                {/* Leaderboard List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {rest.map((item, i) => {
                        const rank = i + 4;
                        const name = item.user?.name || item.name;
                        const val = item.score !== undefined ? `${item.score} নম্বর` : `৳${item.wallet_balance}`;
                        return (
                            <div key={item.id} style={{
                                padding: '12px 16px', borderRadius: 14,
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                                display: 'flex', alignItems: 'center', gap: 12,
                            }}>
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: 13, width: 24 }}>
                                    #{rank}
                                </div>
                                <div style={{ flex: 1, color: 'white', fontWeight: 600, fontSize: 14 }}>
                                    {name}
                                </div>
                                <div style={{ color: '#93b4ff', fontWeight: 800, fontSize: 13 }}>
                                    {val}
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </MobileLayout>
    );
}
