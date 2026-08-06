import { Head, Link } from '@inertiajs/react';
import MobileLayout from '@/Layouts/MobileLayout';

function formatTime(sec) {
    if (!sec) return '—';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}মি ${s}সে`;
}

function ScoreCircle({ score, total }) {
    const pct = total > 0 ? Math.max(0, Math.min(100, (score / total) * 100)) : 0;
    const r = 52;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;

    const color = pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

    return (
        <div className="flex flex-col items-center">
            <svg width="130" height="130" viewBox="0 0 130 130">
                {/* Background circle */}
                <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                {/* Score arc */}
                <circle
                    cx="65" cy="65" r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    transform="rotate(-90 65 65)"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
                <text x="65" y="60" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">
                    {Number(score).toFixed(1)}
                </text>
                <text x="65" y="78" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="12">
                    / {total}
                </text>
            </svg>
            <div className="text-sm mt-1" style={{ color }}>
                {pct >= 80 ? '🏆 চমৎকার!' : pct >= 50 ? '👍 ভালো' : '📚 আরও পড়ুন'}
            </div>
        </div>
    );
}

function LeaderboardRow({ entry, isMe }) {
    const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : null;

    return (
        <div className={`flex items-center gap-3 p-3 rounded-xl mb-2 ${
            isMe ? 'border border-violet-500/50 bg-violet-500/10' : 'bg-white/5'
        }`}>
            <div className="w-8 text-center font-bold text-sm">
                {medal || <span className="text-muted">#{entry.rank}</span>}
            </div>

            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {entry.avatar
                    ? <img src={entry.avatar} className="w-full h-full rounded-full object-cover" />
                    : (entry.name?.[0] || '?')
                }
            </div>

            <div className="flex-1 min-w-0">
                <div className={`font-semibold text-sm truncate ${isMe ? 'text-violet-300' : 'text-white'}`}>
                    {entry.name} {isMe && <span className="text-xs">(আপনি)</span>}
                </div>
                <div className="text-muted text-xs">{formatTime(entry.time_taken_sec)}</div>
            </div>

            <div className="text-right">
                <div className="text-white font-bold text-sm">{Number(entry.score).toFixed(1)}</div>
                <div className="text-muted text-xs">নম্বর</div>
            </div>
        </div>
    );
}

export default function ExamResult({ auth, exam, submission, leaderboard = [] }) {
    const isDisq = submission?.is_disqualified;
    const score  = Number(submission?.score ?? 0);
    const myRank = submission?.rank;
    const myName = auth?.user?.name;

    return (
        <MobileLayout auth={auth}>
            <Head title={`ফলাফল — ${exam.title}`} />

            <div className="px-4 pt-4 pb-24 space-y-4">

                {/* Header */}
                <div className="text-center">
                    <div className="text-2xl mb-1">
                        {isDisq ? '🚫' : myRank === 1 ? '🏆' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : '📋'}
                    </div>
                    <h1 className="text-white font-bold text-lg">{exam.title}</h1>
                    <p className="text-muted text-sm">পরীক্ষার ফলাফল</p>
                </div>

                {/* Disqualified banner */}
                {isDisq && (
                    <div className="card p-4 text-center" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                        <p className="text-red-400 font-bold">🚫 বাতিল</p>
                        <p className="text-muted text-sm mt-1">নকল-রোধ নিয়ম ভঙ্গের কারণে আপনার পরীক্ষা বাতিল করা হয়েছে।</p>
                    </div>
                )}

                {/* Score card */}
                {!isDisq && (
                    <div className="card glass p-6">
                        <div className="flex items-center justify-between">
                            <ScoreCircle score={score} total={exam.total_marks} />

                            <div className="flex-1 ml-6 space-y-3">
                                <div>
                                    <div className="text-muted text-xs">র‍্যাংক</div>
                                    <div className="text-white font-bold text-2xl">
                                        {myRank ? `#${myRank}` : '—'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-muted text-xs">সময় নিয়েছেন</div>
                                    <div className="text-white font-semibold">{formatTime(submission?.time_taken_sec)}</div>
                                </div>
                                <div>
                                    <div className="text-muted text-xs">সতর্কতা</div>
                                    <div className={`font-semibold ${submission?.warning_count > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                                        {submission?.warning_count > 0 ? `⚠️ ${submission.warning_count}টি` : '✓ কোনো সতর্কতা নেই'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Prize info (for paid exams with prize pool) */}
                {exam.prize_pool > 0 && (
                    <div className="card glass p-4">
                        <div className="text-white font-semibold mb-3 flex items-center gap-2">
                            🏆 পুরস্কার বিতরণ
                        </div>
                        <div className="space-y-2">
                            {[
                                { rank: 1, label: '🥇 ১ম স্থান', pct: 60 },
                                { rank: 2, label: '🥈 ২য় স্থান', pct: 30 },
                                { rank: 3, label: '🥉 ৩য় স্থান', pct: 10 },
                            ].map(tier => {
                                const prize = (exam.prize_pool * tier.pct / 100).toFixed(0);
                                const isMyTier = myRank === tier.rank;
                                return (
                                    <div key={tier.rank}
                                         className={`flex justify-between items-center p-2 rounded-lg ${
                                             isMyTier ? 'bg-violet-500/20 border border-violet-500/40' : 'bg-white/5'
                                         }`}>
                                        <span className="text-sm text-white">{tier.label}</span>
                                        <span className={`font-bold text-sm ${isMyTier ? 'text-violet-300' : 'text-yellow-400'}`}>
                                            ৳{prize}
                                            {isMyTier && ' (আপনি পেয়েছেন!)'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        {exam.status === 'PROCESSING' && (
                            <p className="text-muted text-xs mt-3 text-center">পুরস্কার বিতরণ প্রক্রিয়া চলছে...</p>
                        )}
                    </div>
                )}

                {/* Leaderboard */}
                {leaderboard.length > 0 && (
                    <div className="card glass p-4">
                        <div className="text-white font-semibold mb-3 flex items-center gap-2">
                            📊 লিডারবোর্ড
                            <span className="badge badge-info text-xs">{leaderboard.length}জন</span>
                        </div>
                        {leaderboard.map(entry => (
                            <LeaderboardRow
                                key={entry.rank}
                                entry={entry}
                                isMe={entry.name === myName}
                            />
                        ))}
                    </div>
                )}

                {/* Back button */}
                <Link href={route('exams.index')} className="btn btn-primary w-full text-center">
                    আরও পরীক্ষা দেখুন →
                </Link>
                <Link href={route('dashboard')} className="btn w-full text-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    ড্যাশবোর্ডে ফিরুন
                </Link>
            </div>
        </MobileLayout>
    );
}
