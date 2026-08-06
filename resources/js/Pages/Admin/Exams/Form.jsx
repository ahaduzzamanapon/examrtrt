import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

const PRIZE_PRESETS = [
    { label: 'শীর্ষ ৩ (60/30/10)', value: [
        { rank: 1, percent: 60 },
        { rank: 2, percent: 30 },
        { rank: 3, percent: 10 },
    ]},
    { label: 'শীর্ষ ২ (70/30)', value: [
        { rank: 1, percent: 70 },
        { rank: 2, percent: 30 },
    ]},
    { label: 'শুধু ১ম (100%)', value: [
        { rank: 1, percent: 100 },
    ]},
];

export default function ExamForm({ auth, exam, categories = [] }) {
    const isEdit = !!exam;

    const { data, setData, post, patch, processing, errors } = useForm({
        title:              exam?.title ?? '',
        description:        exam?.description ?? '',
        type:               exam?.type ?? 'FREE',
        categories:         exam?.categories ?? [],
        target_streams:     exam?.target_streams ?? [],  // [] = all streams
        entry_fee:          exam?.entry_fee ?? 0,
        total_marks:        exam?.total_marks ?? 100,
        duration_minutes:   exam?.duration_minutes ?? 60,
        negative_marking:   exam?.negative_marking ?? false,
        negative_value:     exam?.negative_value ?? 0.25,
        anti_cheat_limit:   exam?.anti_cheat_limit ?? 3,
        scheduled_at:       exam?.scheduled_at
            ? new Date(exam.scheduled_at).toISOString().slice(0, 16)
            : '',
        admin_fee_percent:  exam?.admin_fee_percent ?? 10,
        prize_distribution: exam?.prize_distribution ?? PRIZE_PRESETS[0].value,
        question_count:     30,
    });

    const [prizePreset, setPrizePreset] = useState(0);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            patch(route('admin.exams.update', exam.id));
        } else {
            post(route('admin.exams.store'));
        }
    };

    const applyPrizePreset = (idx) => {
        setPrizePreset(idx);
        setData('prize_distribution', PRIZE_PRESETS[idx].value);
    };

    const totalPrizePct = data.prize_distribution.reduce((s, t) => s + (t.percent || 0), 0);
    const estimatedPool = data.type === 'PAID' && data.entry_fee > 0
        ? `৳${(data.entry_fee * 100 * (1 - data.admin_fee_percent / 100)).toFixed(0)} (১০০ জন হলে)`
        : null;

    return (
        <AdminLayout title={`${isEdit ? 'সম্পাদনা' : 'নতুন'} পরীক্ষা`}>
            <Head title={`${isEdit ? 'সম্পাদনা' : 'নতুন'} পরীক্ষা`} />

            <div className="px-4 pt-4 pb-24">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href={route('admin.exams.index')} className="text-muted hover:text-white">←</Link>
                    <h1 className="text-white font-bold text-lg">{isEdit ? 'পরীক্ষা সম্পাদনা' : 'নতুন পরীক্ষা তৈরি'}</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* ─── Exam Type ───────────────────────────────────── */}
                    <div className="card glass p-4">
                        <div className="text-white font-semibold mb-3">পরীক্ষার ধরন</div>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setData('type', 'FREE')}
                                className={`p-4 rounded-xl border-2 transition-all text-center ${
                                    data.type === 'FREE'
                                        ? 'border-green-500 bg-green-500/15'
                                        : 'border-white/10 bg-white/5'
                                }`}
                            >
                                <div className="text-2xl mb-1">🎓</div>
                                <div className={`font-bold text-sm ${data.type === 'FREE' ? 'text-green-400' : 'text-white'}`}>
                                    বিনামূল্যে
                                </div>
                                <div className="text-muted text-xs mt-1">কোনো entry fee নেই, prize নেই</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setData('type', 'PAID')}
                                className={`p-4 rounded-xl border-2 transition-all text-center ${
                                    data.type === 'PAID'
                                        ? 'border-yellow-500 bg-yellow-500/15'
                                        : 'border-white/10 bg-white/5'
                                }`}
                            >
                                <div className="text-2xl mb-1">🏆</div>
                                <div className={`font-bold text-sm ${data.type === 'PAID' ? 'text-yellow-400' : 'text-white'}`}>
                                    পেইড কনটেস্ট
                                </div>
                                <div className="text-muted text-xs mt-1">Entry fee আছে, prize pool আছে</div>
                            </button>
                        </div>
                    </div>

                    {/* ─── Basic Info ──────────────────────────────────── */}
                    <div className="card glass p-4 space-y-4">
                        <div className="text-white font-semibold">মৌলিক তথ্য</div>

                        <div>
                            <label className="text-muted text-sm mb-1 block">শিরোনাম *</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                placeholder="যেমন: BCS প্রস্তুতি কনটেস্ট #১"
                                required
                            />
                            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="text-muted text-sm mb-1 block">বিবরণ</label>
                            <textarea
                                className="input w-full resize-none"
                                rows={2}
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                placeholder="পরীক্ষা সম্পর্কে সংক্ষিপ্ত বিবরণ..."
                            />
                        </div>

                        <div>
                            <label className="text-muted text-sm mb-1 block">বিষয়/ক্যাটাগরি *</label>
                            <div className="flex flex-wrap gap-2">
                                {['bcs', 'primary', 'bank', 'ssc', 'hsc', 'medical', 'university'].map(cat => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => {
                                            const arr = data.categories.includes(cat)
                                                ? data.categories.filter(c => c !== cat)
                                                : [...data.categories, cat];
                                            setData('categories', arr);
                                        }}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all uppercase ${
                                            data.categories.includes(cat)
                                                ? 'bg-violet-500 border-violet-500 text-white'
                                                : 'border-white/20 text-muted'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            {errors.categories && <p className="text-red-400 text-xs mt-1">{errors.categories}</p>}
                        </div>

                        {/* Target streams — only relevant for hsc/ssc categories */}
                        {(data.categories.includes('hsc') || data.categories.includes('ssc')) && (
                            <div>
                                <label className="text-muted text-sm mb-1 block">🎓 কোন বিভাগের জন্য?</label>
                                <div className="text-xs text-white/30 mb-2">খালি রাখলে সব বিভাগ দেখতে পাবে</div>
                                <div className="flex flex-wrap gap-2">
                                    {[{id:'science',label:'🔬 বিজ্ঞান'},{id:'arts',label:'📜 মানবিক'},{id:'commerce',label:'💼 বাণিজ্য'}].map(s => (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => {
                                                const arr = data.target_streams.includes(s.id)
                                                    ? data.target_streams.filter(x => x !== s.id)
                                                    : [...data.target_streams, s.id];
                                                setData('target_streams', arr);
                                            }}
                                            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                                                data.target_streams.includes(s.id)
                                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                                    : 'border-white/20 text-muted'
                                            }`}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                                {data.target_streams.length > 0 && (
                                    <div className="text-xs text-emerald-400 mt-2">
                                        ✓ শুধু {data.target_streams.join(', ')} বিভাগের ছাত্ররা দেখবে
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ─── Exam Config ─────────────────────────────────── */}
                    <div className="card glass p-4 space-y-4">
                        <div className="text-white font-semibold">পরীক্ষার কনফিগ</div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-muted text-sm mb-1 block">মোট নম্বর</label>
                                <input type="number" className="input w-full" value={data.total_marks}
                                    onChange={e => setData('total_marks', +e.target.value)} min={1} />
                            </div>
                            <div>
                                <label className="text-muted text-sm mb-1 block">সময় (মিনিট)</label>
                                <input type="number" className="input w-full" value={data.duration_minutes}
                                    onChange={e => setData('duration_minutes', +e.target.value)} min={1} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-muted text-sm mb-1 block">প্রশ্ন সংখ্যা</label>
                                <input type="number" className="input w-full" value={data.question_count}
                                    onChange={e => setData('question_count', +e.target.value)} min={1} max={200}
                                    disabled={isEdit} />
                            </div>
                            <div>
                                <label className="text-muted text-sm mb-1 block">Anti-cheat সীমা</label>
                                <input type="number" className="input w-full" value={data.anti_cheat_limit}
                                    onChange={e => setData('anti_cheat_limit', +e.target.value)} min={0} max={10} />
                                <div className="text-muted text-xs mt-1">(০ = অক্ষম)</div>
                            </div>
                        </div>

                        {/* Negative marking */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setData('negative_marking', !data.negative_marking)}
                                className={`w-12 h-6 rounded-full transition-all flex-shrink-0 relative ${data.negative_marking ? 'bg-red-500' : 'bg-white/20'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${data.negative_marking ? 'left-7' : 'left-1'}`} />
                            </button>
                            <div>
                                <div className="text-white text-sm font-medium">নেগেটিভ মার্কিং</div>
                                {data.negative_marking && (
                                    <input type="number" className="input text-xs mt-1" value={data.negative_value} step="0.25"
                                        onChange={e => setData('negative_value', +e.target.value)}
                                        style={{ width: '80px' }} placeholder="0.25" />
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="text-muted text-sm mb-1 block">পরীক্ষার তারিখ ও সময় *</label>
                            <input type="datetime-local" className="input w-full"
                                value={data.scheduled_at}
                                onChange={e => setData('scheduled_at', e.target.value)} required />
                            {errors.scheduled_at && <p className="text-red-400 text-xs mt-1">{errors.scheduled_at}</p>}
                        </div>
                    </div>

                    {/* ─── PAID-only: Entry fee + Prize ────────────────── */}
                    {data.type === 'PAID' && (
                        <div className="card glass p-4 space-y-4" style={{ borderColor: 'rgba(251,191,36,0.3)' }}>
                            <div className="text-yellow-400 font-semibold flex items-center gap-2">
                                🏆 পেইড কনটেস্ট সেটিং
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-muted text-sm mb-1 block">Entry Fee (৳)</label>
                                    <input type="number" className="input w-full" value={data.entry_fee} min={0} step={5}
                                        onChange={e => setData('entry_fee', +e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-muted text-sm mb-1 block">Admin Fee (%)</label>
                                    <input type="number" className="input w-full" value={data.admin_fee_percent} min={0} max={50}
                                        onChange={e => setData('admin_fee_percent', +e.target.value)} />
                                    <div className="text-muted text-xs mt-1">প্ল্যাটফর্ম কমিশন</div>
                                </div>
                            </div>

                            {estimatedPool && (
                                <div className="p-3 rounded-lg text-center"
                                     style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
                                    <div className="text-yellow-400 text-sm font-semibold">আনুমানিক Prize Pool</div>
                                    <div className="text-white font-bold">{estimatedPool}</div>
                                </div>
                            )}

                            {/* Prize distribution */}
                            <div>
                                <label className="text-muted text-sm mb-2 block">পুরস্কার বিতরণ</label>
                                <div className="flex gap-2 flex-wrap mb-3">
                                    {PRIZE_PRESETS.map((p, i) => (
                                        <button key={i} type="button"
                                            onClick={() => applyPrizePreset(i)}
                                            className={`px-2 py-1 rounded text-xs border ${prizePreset === i ? 'border-yellow-500 bg-yellow-500/20 text-yellow-300' : 'border-white/20 text-muted'}`}>
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                                {data.prize_distribution.map((tier, i) => (
                                    <div key={i} className="flex items-center gap-2 mb-2">
                                        <span className="text-white text-sm w-16">#{tier.rank} স্থান</span>
                                        <input type="number" className="input flex-1 text-sm" value={tier.percent} min={0} max={100}
                                            onChange={e => {
                                                const arr = [...data.prize_distribution];
                                                arr[i] = { ...arr[i], percent: +e.target.value };
                                                setData('prize_distribution', arr);
                                            }} />
                                        <span className="text-muted text-sm">%</span>
                                    </div>
                                ))}
                                <div className={`text-xs mt-1 ${totalPrizePct === 100 ? 'text-green-400' : 'text-red-400'}`}>
                                    মোট: {totalPrizePct}% {totalPrizePct !== 100 && '(১০০% হতে হবে)'}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* FREE exam info box */}
                    {data.type === 'FREE' && (
                        <div className="p-4 rounded-xl text-center"
                             style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                            <div className="text-green-400 text-sm">
                                ✅ এটি একটি বিনামূল্যে কনটেস্ট। অংশগ্রহণকারীরা leaderboard এ র‍্যাংক পাবে কিন্তু কোনো prize থাকবে না।
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={processing || (data.type === 'PAID' && totalPrizePct !== 100)}
                        className="btn btn-primary w-full"
                    >
                        {processing ? 'সংরক্ষণ হচ্ছে...' : isEdit ? 'পরীক্ষা আপডেট করুন' : 'পরীক্ষা তৈরি করুন'}
                    </button>

                    {errors.question_count && (
                        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            {errors.question_count}
                        </div>
                    )}
                </form>
            </div>
        </AdminLayout>
    );
}
