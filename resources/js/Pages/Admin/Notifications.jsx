import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, Send, Users, Image as ImageIcon, Link as LinkIcon,
    CheckCircle, AlertCircle, Loader2, Zap, Target, Mail, Smartphone, Radio,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

const GOALS = [
    { id: 'all',         emoji: '🌐', label: 'সবাই' },
    { id: 'ssc',         emoji: '📗', label: 'SSC' },
    { id: 'hsc',         emoji: '📘', label: 'HSC' },
    { id: 'bcs',         emoji: '🏛️', label: 'BCS' },
    { id: 'medical',     emoji: '⚕️', label: 'Medical' },
    { id: 'engineering', emoji: '⚙️', label: 'Engineering' },
    { id: 'bank',        emoji: '🏦', label: 'Bank Job' },
    { id: 'university',  emoji: '🎓', label: 'University' },
    { id: 'primary',     emoji: '✏️', label: 'Primary' },
    { id: 'other',       emoji: '📋', label: 'Other' },
];

const TEMPLATES = [
    {
        id: 'welcome',
        emoji: '🎉',
        label: 'স্বাগতম',
        title: 'Exam Arena তে স্বাগতম! 🎉',
        body: 'আমাদের সাথে যোগ দেওয়ার জন্য ধন্যবাদ। প্রতিদিন অনুশীলন করুন এবং তোমার লক্ষ্য অর্জন করো।',
        click_url: '/dashboard',
        target: 'all',
    },
    {
        id: 'contest_live',
        emoji: '⚡',
        label: 'Contest শুরু',
        title: 'Live Contest শুরু হয়েছে! ⚡',
        body: 'এখনই যোগ দাও এবং পয়েন্ট জিতে নাও। সময় সীমিত!',
        click_url: '/dashboard',
        target: 'all',
    },
    {
        id: 'result',
        emoji: '🏆',
        label: 'ফলাফল',
        title: 'তোমার পরীক্ষার ফলাফল প্রকাশিত হয়েছে! 🏆',
        body: 'এখনই দেখো তুমি কত পয়েন্ট পেয়েছো এবং লিডারবোর্ডে তোমার অবস্থান কোথায়।',
        click_url: '/dashboard',
        target: 'all',
    },
    {
        id: 'offer',
        emoji: '🎁',
        label: 'বিশেষ অফার',
        title: 'বিশেষ অফার! আজই সুযোগ নাও 🎁',
        body: 'সীমিত সময়ের জন্য বিশেষ সুবিধা পাচ্ছো। এখনই প্রোফাইলে যাও।',
        click_url: '/dashboard',
        target: 'all',
    },
    {
        id: 'motivation',
        emoji: '💪',
        label: 'অনুপ্রেরণা',
        title: 'আজও একটু পড়ো, স্বপ্ন পূরণ হবে! 💪',
        body: 'ধারাবাহিকতাই সাফল্যের চাবিকাঠি। আজকের প্র্যাকটিস সেশন শুরু করো।',
        click_url: '/dashboard',
        target: 'all',
    },
    {
        id: 'token_bonus',
        emoji: '🪙',
        label: 'Token Bonus',
        title: 'বিনামূল্যে Token পাও! 🪙',
        body: 'আজ লগইন করলেই পাবে বোনাস Token। এখনই অ্যাপ খোলো।',
        click_url: '/dashboard',
        target: 'all',
    },
];


function StatCard({ value, label, color }) {
    return (
        <div style={{
            padding: '16px 20px', borderRadius: 16,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            minWidth: 110,
        }}>
            <div style={{ fontSize: 26, fontWeight: 900, color }}>{value}</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 3 }}>{label}</div>
        </div>
    );
}

export default function Notifications({ stats }) {
    const { flash } = usePage().props;
    const [preview, setPreview] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        title:     '',
        body:      '',
        image_url: '',
        target:    'all',
        click_url: '/dashboard',
        channel:   'push',
    });

    const selectedGoal = GOALS.find(g => g.id === data.target);
    const targetCount  = data.target === 'all'
        ? (stats?.total ?? 0)
        : (stats?.by_goal?.[data.target] ?? 0);

    const applyTemplate = (tpl) => {
        setData(d => ({ ...d, title: tpl.title, body: tpl.body, click_url: tpl.click_url, target: tpl.target }));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.notifications.send'), {
            onSuccess: () => reset('title', 'body', 'image_url'),
        });
    };

    return (
        <AdminLayout title="Push Notifications">
            <style>{`
                input, textarea { font-family: inherit; }
                input:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px rgba(255,255,255,0.06) inset !important; -webkit-text-fill-color: #fff !important; }
            `}</style>

            <div style={{ maxWidth: 900 }}>

                    {/* Flash messages */}
                    <AnimatePresence>
                        {flash?.success && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 14, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', marginBottom: 20, fontSize: 14 }}>
                                <CheckCircle size={16} /> {flash.success}
                            </motion.div>
                        )}
                        {flash?.error && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 14, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', marginBottom: 20, fontSize: 14 }}>
                                <AlertCircle size={16} /> {flash.error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Stats row */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                        style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
                        <StatCard value={stats?.total ?? 0} label="📲 Push Subscribers" color="#4d6fff" />
                        <StatCard value={stats?.total_email ?? 0} label="📧 Email Users" color="#10b981" />
                        {GOALS.filter(g => g.id !== 'all').map(g => {
                            const cnt = stats?.by_goal?.[g.id] ?? 0;
                            if (!cnt) return null;
                            return <StatCard key={g.id} value={cnt} label={g.label} color="rgba(255,255,255,0.7)" />;
                        })}
                    </motion.div>

                    {/* ── Quick Templates ────────────────────────────────── */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
                        style={{ marginBottom: 24, padding: '16px 18px', borderRadius: 16, background: 'rgba(77,111,255,0.06)', border: '1px solid rgba(77,111,255,0.15)' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                            ⚡ দ্রুত টেমপ্লেট
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                            {TEMPLATES.map(tpl => (
                                <motion.button key={tpl.id} type="button" whileTap={{ scale: 0.93 }}
                                    onClick={() => applyTemplate(tpl)}
                                    style={{
                                        padding: '7px 14px', borderRadius: 20, border: '1px solid rgba(77,111,255,0.25)',
                                        background: data.title === tpl.title ? 'rgba(77,111,255,0.25)' : 'rgba(255,255,255,0.05)',
                                        color: data.title === tpl.title ? '#93b4ff' : 'rgba(255,255,255,0.6)',
                                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                        transition: 'all 0.15s',
                                        display: 'flex', alignItems: 'center', gap: 5,
                                    }}>
                                    {tpl.emoji} {tpl.label}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 20, alignItems: 'start' }}>

                        {/* Form */}
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                            <form onSubmit={submit}>
                                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: '24px', backdropFilter: 'blur(20px)' }}>

                                    {/* Target audience */}
                                    <div style={{ marginBottom: 18 }}>
                                        <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                                            <Target size={12} /> টার্গেট অডিয়েন্স
                                        </label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                                            {GOALS.map(g => (
                                                <button key={g.id} type="button" onClick={() => setData('target', g.id)}
                                                    style={{
                                                        padding: '7px 12px', borderRadius: 10, fontSize: 13, cursor: 'pointer',
                                                        background: data.target === g.id ? 'rgba(77,111,255,0.25)' : 'rgba(255,255,255,0.05)',
                                                        border: `1.5px solid ${data.target === g.id ? '#4d6fff' : 'rgba(255,255,255,0.1)'}`,
                                                        color: data.target === g.id ? '#93b4ff' : 'rgba(255,255,255,0.6)',
                                                        fontWeight: data.target === g.id ? 700 : 400,
                                                        transition: 'all 0.15s',
                                                    }}>
                                                    {g.emoji} {g.label}
                                                </button>
                                            ))}
                                        </div>
                                        <div style={{ marginTop: 8, color: '#fbbf24', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <Users size={12} />
                                            {selectedGoal?.emoji} {selectedGoal?.label} — প্রায় <strong style={{ color: '#f59e0b' }}>{targetCount} জন</strong> পাবে
                                        </div>
                                    </div>

                                    {/* Channel selector */}
                                    <div style={{ marginBottom: 18 }}>
                                        <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                                            <Radio size={12} /> পাঠানোর মাধ্যম
                                        </label>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            {[
                                                { id: 'push',  icon: Smartphone, label: 'Push Only',  color: '#4d6fff' },
                                                { id: 'email', icon: Mail,        label: 'Email Only', color: '#10b981' },
                                                { id: 'both',  icon: Send,        label: 'Push + Email', color: '#f59e0b' },
                                            ].map(ch => (
                                                <button key={ch.id} type="button" onClick={() => setData('channel', ch.id)}
                                                    style={{
                                                        flex: 1, padding: '10px 8px', borderRadius: 12, fontSize: 12,
                                                        cursor: 'pointer', display: 'flex', flexDirection: 'column',
                                                        alignItems: 'center', gap: 5,
                                                        background: data.channel === ch.id ? `rgba(${ch.id==='push'?'77,111,255':ch.id==='email'?'16,185,129':'245,158,11'},0.2)` : 'rgba(255,255,255,0.05)',
                                                        border: `1.5px solid ${data.channel === ch.id ? ch.color : 'rgba(255,255,255,0.1)'}`,
                                                        color: data.channel === ch.id ? ch.color : 'rgba(255,255,255,0.5)',
                                                        fontWeight: data.channel === ch.id ? 700 : 400,
                                                        transition: 'all 0.15s',
                                                    }}>
                                                    <ch.icon size={14} />
                                                    {ch.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <div style={{ marginBottom: 14 }}>
                                        <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>
                                            শিরোনাম (Title)
                                        </label>
                                        <input
                                            type="text" maxLength={100}
                                            value={data.title} onChange={e => setData('title', e.target.value)}
                                            placeholder="যেমন: 🔥 নতুন BCS কনটেস্ট শুরু হচ্ছে!"
                                            style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: `1.5px solid ${errors.title ? 'rgba(248,113,113,0.6)' : 'rgba(255,255,255,0.12)'}`, borderRadius: 12, color: 'white', fontSize: 14, outline: 'none' }}
                                        />
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                                            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>{data.title.length}/100</span>
                                        </div>
                                        {errors.title && <p style={{ color: '#f87171', fontSize: 12, marginTop: 3 }}>{errors.title}</p>}
                                    </div>

                                    {/* Body */}
                                    <div style={{ marginBottom: 14 }}>
                                        <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>
                                            বার্তা (Message)
                                        </label>
                                        <textarea
                                            rows={3} maxLength={500}
                                            value={data.body} onChange={e => setData('body', e.target.value)}
                                            placeholder="যেমন: আজ রাত ৯টায় BCS Live Contest শুরু হচ্ছে। এখনই জয়েন করুন!"
                                            style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: `1.5px solid ${errors.body ? 'rgba(248,113,113,0.6)' : 'rgba(255,255,255,0.12)'}`, borderRadius: 12, color: 'white', fontSize: 14, outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
                                        />
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                                            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>{data.body.length}/500</span>
                                        </div>
                                        {errors.body && <p style={{ color: '#f87171', fontSize: 12, marginTop: 3 }}>{errors.body}</p>}
                                    </div>

                                    {/* Image URL */}
                                    <div style={{ marginBottom: 14 }}>
                                        <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <ImageIcon size={11} /> ছবির URL (ঐচ্ছিক)
                                        </label>
                                        <input
                                            type="url"
                                            value={data.image_url} onChange={e => setData('image_url', e.target.value)}
                                            placeholder="https://example.com/banner.jpg"
                                            style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: `1.5px solid ${errors.image_url ? 'rgba(248,113,113,0.6)' : 'rgba(255,255,255,0.12)'}`, borderRadius: 12, color: 'white', fontSize: 14, outline: 'none' }}
                                        />
                                        {errors.image_url && <p style={{ color: '#f87171', fontSize: 12, marginTop: 3 }}>{errors.image_url}</p>}
                                    </div>

                                    {/* Click URL */}
                                    <div style={{ marginBottom: 22 }}>
                                        <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <LinkIcon size={11} /> ক্লিক করলে যাবে
                                        </label>
                                        <input
                                            type="text"
                                            value={data.click_url} onChange={e => setData('click_url', e.target.value)}
                                            placeholder="/dashboard অথবা /exams/123"
                                            style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 12, color: 'white', fontSize: 14, outline: 'none' }}
                                        />
                                    </div>

                                    {/* Submit */}
                                    <motion.button whileTap={{ scale: 0.97 }} type="submit"
                                        disabled={processing || !data.title || !data.body}
                                        style={{
                                            width: '100%', padding: '14px', borderRadius: 13, border: 'none',
                                            background: (processing || !data.title || !data.body)
                                                ? 'rgba(77,111,255,0.25)'
                                                : data.channel === 'email' ? 'linear-gradient(135deg,#059669,#10b981)'
                                                : data.channel === 'both'  ? 'linear-gradient(135deg,#f59e0b,#d97706)'
                                                : 'linear-gradient(135deg,#4d6fff,#7c3aed)',
                                            color: 'white', fontWeight: 700, fontSize: 15,
                                            cursor: (processing || !data.title || !data.body) ? 'not-allowed' : 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                            boxShadow: (!processing && data.title && data.body) ? '0 6px 20px rgba(77,111,255,0.35)' : 'none',
                                        }}>
                                        {processing
                                            ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> পাঠানো হচ্ছে...</>
                                            : data.channel === 'email'
                                                ? <><Mail size={15} /> {stats?.total_email ?? 0} জনকে Email পাঠাও</>
                                                : data.channel === 'both'
                                                    ? <><Send size={15} /> Push + Email উভয়ই পাঠাও</>
                                                    : <><Send size={15} /> {targetCount} জনকে Push পাঠাও</>
                                        }
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>

                        {/* Preview Panel */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: '20px', backdropFilter: 'blur(20px)', position: 'sticky', top: 20 }}>
                                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Bell size={11} /> Notification Preview
                                </div>

                                {/* Android-style notification preview */}
                                <div style={{ background: '#1e1e2e', borderRadius: 14, padding: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    {/* Top bar */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                        <div style={{ width: 18, height: 18, borderRadius: 5, background: 'linear-gradient(135deg,#4d6fff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Zap size={10} color="white" fill="white" />
                                        </div>
                                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Exam Arena • এখনই</span>
                                    </div>

                                    {/* Content */}
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 4, lineHeight: 1.3 }}>
                                                {data.title || '🔔 Notification শিরোনাম...'}
                                            </div>
                                            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, lineHeight: 1.5 }}>
                                                {data.body || 'Notification এর বিস্তারিত বার্তা এখানে দেখাবে...'}
                                            </div>
                                        </div>
                                        {data.image_url && (
                                            <img src={data.image_url} alt="preview"
                                                style={{ width: 60, height: 60, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                                                onError={e => e.target.style.display='none'} />
                                        )}
                                    </div>

                                    {/* Banner image */}
                                    {data.image_url && (
                                        <div style={{ marginTop: 10 }}>
                                            <img src={data.image_url} alt="banner"
                                                style={{ width: '100%', borderRadius: 10, objectFit: 'cover', maxHeight: 120 }}
                                                onError={e => e.target.style.display='none'} />
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                        <div style={{ flex: 1, padding: '6px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', textAlign: 'center', fontSize: 12, color: '#93b4ff', fontWeight: 600 }}>খুলুন</div>
                                        <div style={{ flex: 1, padding: '6px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>বাতিল</div>
                                    </div>
                                </div>

                                {/* Tips */}
                                <div style={{ marginTop: 16, padding: '12px', borderRadius: 12, background: 'rgba(77,111,255,0.08)', border: '1px solid rgba(77,111,255,0.15)' }}>
                                    <div style={{ color: '#93b4ff', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>💡 টিপস</div>
                                    {[
                                        'Emoji দিলে notification বেশি আকর্ষণীয় হয়',
                                        'ছবির URL অবশ্যই HTTPS হতে হবে',
                                        'শিরোনাম ছোট রাখো (৬০ অক্ষরের মধ্যে)',
                                    ].map(t => (
                                        <div key={t} style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 3, paddingLeft: 8 }}>• {t}</div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
        </AdminLayout>
    );
}
