import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { MessageSquare, Star, Send, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

export default function FeedbacksIndex({ auth, feedbacks }) {
    const [replyingId, setReplyingId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleReplySubmit = (id) => {
        if (!replyText.trim()) return;
        setSubmitting(true);
        router.post(route('admin.feedbacks.reply', id), {
            admin_reply: replyText,
            status: 'RESOLVED',
        }, {
            onSuccess: () => {
                setReplyingId(null);
                setReplyText('');
                setSubmitting(false);
            },
            onError: () => setSubmitting(false),
        });
    };

    const getTypeBadge = (type) => {
        switch (type) {
            case 'BUG_REPORT': return <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">🐞 বাগ রিপোর্ট</span>;
            case 'SUGGESTION': return <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">💡 পরামর্শ</span>;
            case 'COMPLAINT': return <span className="px-2 py-0.5 rounded text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">⚠️ অভিযোগ</span>;
            default: return <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">💬 সাধারণ</span>;
        }
    };

    return (
        <AdminLayout title="ইউজার ফিডব্যাক ও মতামত">
            <Head title="ইউজার ফিডব্যাক" />

            <div className="p-4 md:p-6 pb-24 max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-white text-xl font-extrabold flex items-center gap-2">
                            <MessageSquare className="text-blue-400" /> ইউজার ফিডব্যাক ও মতামত
                        </h1>
                        <p className="text-white/50 text-xs mt-1">শিক্ষার্থীদের পাঠানো সকল ফিডব্যাক ও রেটিং এখানে দেখতে পারবেন</p>
                    </div>
                </div>

                {feedbacks.data.length === 0 ? (
                    <div className="card glass p-8 text-center text-white/50">
                        এখনো কোনো ফিডব্যাক পাওয়া যায়নি
                    </div>
                ) : (
                    <div className="space-y-4">
                        {feedbacks.data.map(fb => (
                            <div key={fb.id} className="card glass p-5 space-y-3 relative border border-white/10 hover:border-blue-500/30 transition-all">
                                <div className="flex items-start justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white text-sm">
                                            {fb.user?.name?.[0]?.toUpperCase() ?? 'U'}
                                        </div>
                                        <div>
                                            <div className="text-white font-bold text-sm flex items-center gap-2">
                                                {fb.user?.name ?? 'অজ্ঞাত ইউজার'}
                                                <span className="text-white/40 text-xs">({fb.user?.email})</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                {getTypeBadge(fb.type)}
                                                <div className="flex text-yellow-400 text-xs">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={12} fill={i < fb.rating ? 'currentColor' : 'none'} className={i < fb.rating ? '' : 'text-white/20'} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-xs text-white/40 flex items-center gap-1">
                                        <Clock size={12} /> {new Date(fb.created_at).toLocaleString('bn-BD')}
                                    </div>
                                </div>

                                <div className="text-white/90 text-sm bg-white/5 p-3 rounded-xl border border-white/5 whitespace-pre-wrap">
                                    {fb.message}
                                </div>

                                {fb.admin_reply && (
                                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl space-y-1">
                                        <div className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                                            <CheckCircle2 size={13} /> এডমিন উত্তর:
                                        </div>
                                        <div className="text-white/80 text-xs whitespace-pre-wrap">{fb.admin_reply}</div>
                                    </div>
                                )}

                                <div className="flex justify-end">
                                    {replyingId === fb.id ? (
                                        <div className="w-full mt-2 space-y-2">
                                            <textarea
                                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-blue-500 outline-none"
                                                rows={2}
                                                placeholder="উত্তর লিখুন..."
                                                value={replyText}
                                                onChange={e => setReplyText(e.target.value)}
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setReplyingId(null)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white/60 hover:bg-white/10"
                                                >
                                                    বাতিল
                                                </button>
                                                <button
                                                    onClick={() => handleReplySubmit(fb.id)}
                                                    disabled={submitting}
                                                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                                                >
                                                    <Send size={12} /> পাঠান
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => { setReplyingId(fb.id); setReplyText(fb.admin_reply || ''); }}
                                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-blue-400 text-xs font-bold flex items-center gap-1 border border-white/10"
                                        >
                                            <Send size={12} /> {fb.admin_reply ? 'উত্তর সম্পাদনা' : 'উত্তর দিন'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
