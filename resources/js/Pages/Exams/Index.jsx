import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MobileLayout from '@/Layouts/MobileLayout';

const STATUS_BADGE = {
    SCHEDULED: { label: 'আসছে', cls: 'badge-info' },
    LIVE:      { label: '🔴 লাইভ', cls: 'badge-live' },
};

function CountdownTimer({ scheduledAt }) {
    const [timeLeft, setTimeLeft] = useState('');

    useState(() => {
        const tick = () => {
            const diff = new Date(scheduledAt) - new Date();
            if (diff <= 0) { setTimeLeft('শুরু হয়েছে'); return; }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${h}ঘ ${m}মি ${s}সে`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [scheduledAt]);

    return <span className="text-warning font-mono text-sm">{timeLeft}</span>;
}

function ExamCard({ exam, auth }) {
    const [loading, setLoading] = useState(false);

    const handleJoin = () => {
        setLoading(true);
        router.post(route('exams.join', exam.id), {}, {
            onFinish: () => setLoading(false),
        });
    };

    const handleEnterRoom = () => {
        router.visit(route('exams.room', exam.id));
    };

    const badge = STATUS_BADGE[exam.status] || { label: exam.status, cls: 'badge-info' };

    return (
        <div className="card glass mb-4 overflow-hidden">
            {/* Header stripe */}
            <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />

            <div className="p-4">
                {/* Status + type */}
                <div className="flex items-center gap-2 mb-2">
                    <span className={`badge ${badge.cls} text-xs`}>{badge.label}</span>
                    <span className={`badge ${exam.type === 'FREE' ? 'badge-success' : 'badge-warning'} text-xs`}>
                        {exam.type === 'FREE' ? 'বিনামূল্যে' : `৳${exam.entry_fee}`}
                    </span>
                </div>

                <h3 className="text-white font-bold text-base mb-1">{exam.title}</h3>
                {exam.description && (
                    <p className="text-muted text-sm mb-3 line-clamp-2">{exam.description}</p>
                )}

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center">
                        <div className="text-white font-bold text-sm">{exam.total_marks}</div>
                        <div className="text-muted text-xs">মোট নম্বর</div>
                    </div>
                    <div className="text-center">
                        <div className="text-white font-bold text-sm">{exam.duration_minutes}মি</div>
                        <div className="text-muted text-xs">সময়</div>
                    </div>
                    <div className="text-center">
                        <div className="text-white font-bold text-sm">{exam.participant_count}</div>
                        <div className="text-muted text-xs">অংশগ্রহণকারী</div>
                    </div>
                </div>

                {/* Prize pool */}
                {exam.prize_pool > 0 && (
                    <div className="flex items-center gap-2 mb-3 p-2 rounded-lg"
                         style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
                        <span className="text-lg">🏆</span>
                        <div>
                            <div className="text-warning font-bold text-sm">৳{exam.prize_pool.toFixed(0)} পুরস্কার</div>
                            <div className="text-muted text-xs">শীর্ষ ৩ জন পাবেন</div>
                        </div>
                    </div>
                )}

                {/* Timer */}
                {exam.status === 'SCHEDULED' && (
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-muted text-sm">শুরু হবে:</span>
                        <CountdownTimer scheduledAt={exam.scheduled_at} />
                    </div>
                )}

                {/* CTA Button */}
                {exam.status === 'LIVE' && exam.joined ? (
                    <button className="btn btn-primary w-full" onClick={handleEnterRoom}>
                        পরীক্ষার হলে প্রবেশ করুন →
                    </button>
                ) : exam.status === 'LIVE' && !exam.joined ? (
                    <div className="text-muted text-sm text-center">নিবন্ধন বন্ধ (পরীক্ষা শুরু হয়ে গেছে)</div>
                ) : exam.joined ? (
                    <div className="btn btn-success w-full opacity-75 cursor-default">✓ নিবন্ধিত</div>
                ) : (
                    <button
                        className="btn btn-primary w-full"
                        onClick={handleJoin}
                        disabled={loading}
                    >
                        {loading ? 'যোগ দিচ্ছে...' : exam.type === 'FREE' ? 'বিনামূল্যে যোগ দিন' : `৳${exam.entry_fee} দিয়ে যোগ দিন`}
                    </button>
                )}
            </div>
        </div>
    );
}

export default function ExamsIndex({ auth, exams = [] }) {
    const live  = exams.filter(e => e.status === 'LIVE');
    const sched = exams.filter(e => e.status === 'SCHEDULED');

    return (
        <MobileLayout auth={auth}>
            <Head title="পরীক্ষাসমূহ — NXLY Exam Arena" />

            <div className="px-4 pt-4 pb-24">
                <h1 className="text-xl font-bold text-white mb-4">📋 পরীক্ষাসমূহ</h1>

                {exams.length === 0 && (
                    <div className="card glass p-8 text-center">
                        <div className="text-4xl mb-3">📭</div>
                        <p className="text-muted">এখন কোনো পরীক্ষা নেই। শীঘ্রই আসছে!</p>
                    </div>
                )}

                {live.length > 0 && (
                    <>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-white font-semibold">এখন চলছে</span>
                        </div>
                        {live.map(e => <ExamCard key={e.id} exam={e} auth={auth} />)}
                    </>
                )}

                {sched.length > 0 && (
                    <>
                        <div className="text-white font-semibold mb-3 mt-4">আসন্ন পরীক্ষা</div>
                        {sched.map(e => <ExamCard key={e.id} exam={e} auth={auth} />)}
                    </>
                )}
            </div>
        </MobileLayout>
    );
}
