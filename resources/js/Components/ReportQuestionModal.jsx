import { useState } from 'react';
import { router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, Send, CheckCircle2 } from 'lucide-react';

const PRESET_REASONS = [
    'সঠিক উত্তর দেওয়া নেই / অপশন ভুল',
    'প্রশ্নে বানান বা তথ্যগত ভুল আছে',
    'টাইপিং বা ফরম্যাটিং ত্রুটি',
    'প্রশ্নটি ঝাপসা বা অসম্পূর্ণ',
];

export default function ReportQuestionModal({ questionId, questionText, isOpen, onClose }) {
    const [selectedReason, setSelectedReason] = useState(PRESET_REASONS[0]);
    const [customReason, setCustomReason] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const reason = customReason.trim() || selectedReason;
        setLoading(true);

        router.post(route('disputes.store'), {
            question_id: questionId,
            report_reason: reason,
        }, {
            onSuccess: () => {
                setLoading(false);
                setSubmitted(true);
                setTimeout(() => {
                    setSubmitted(false);
                    onClose();
                }, 1500);
            },
            onError: () => {
                setLoading(false);
            },
        });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{
                    position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)',
                    backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
                }}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                    style={{
                        width: '100%', maxWidth: 420, borderRadius: 24, padding: 24,
                        background: 'linear-gradient(135deg,rgba(15,20,50,0.98),rgba(30,15,40,0.98))',
                        border: '1px solid rgba(239,68,68,0.3)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontWeight: 900, fontSize: 17 }}>
                            <Flag size={20} /> প্রশ্ন রিপোর্ট করুন
                        </div>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 20 }}>✕</button>
                    </div>

                    {submitted ? (
                        <div style={{ textAlign: 'center', padding: '24px 0', color: '#34d399' }}>
                            <CheckCircle2 size={48} style={{ margin: '0 auto 10px' }} />
                            <div style={{ fontWeight: 800, fontSize: 16 }}>রিপোর্ট জমা হয়েছে!</div>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 }}>অ্যাডমিন খতিয়ে দেখে ব্যবস্থা নেবেন।</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {questionText && (
                                <div style={{
                                    padding: '10px 12px', borderRadius: 12,
                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                                    color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 1.5, maxH: 80, overflowY: 'auto'
                                }}>
                                    "{questionText}"
                                </div>
                            )}

                            <div>
                                <label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                                    সমস্যার ধরণ নির্বাচন করুন
                                </label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {PRESET_REASONS.map((reason) => (
                                        <button
                                            key={reason}
                                            type="button"
                                            onClick={() => { setSelectedReason(reason); setCustomReason(''); }}
                                            style={{
                                                padding: '10px 12px', borderRadius: 10, border: '1px solid', cursor: 'pointer',
                                                background: selectedReason === reason && !customReason ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.03)',
                                                borderColor: selectedReason === reason && !customReason ? '#ef4444' : 'rgba(255,255,255,0.08)',
                                                color: selectedReason === reason && !customReason ? '#f87171' : 'rgba(255,255,255,0.7)',
                                                fontWeight: 600, fontSize: 12, textAlign: 'left',
                                            }}
                                        >
                                            {reason}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                                    অথবা বিস্তারিত লিখুন (ঐচ্ছিক)
                                </label>
                                <textarea
                                    value={customReason}
                                    onChange={e => setCustomReason(e.target.value)}
                                    placeholder="সুনির্দিষ্টভাবে লিখুন কি সমস্যা রয়েছে..."
                                    rows={2}
                                    style={{
                                        width: '100%', padding: '10px 12px', borderRadius: 12,
                                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'white', fontSize: 13, outline: 'none', resize: 'none',
                                    }}
                                />
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: '12px', borderRadius: 12, border: 'none',
                                    background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                                    color: 'white', fontWeight: 800, fontSize: 14, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                    marginTop: 4, boxShadow: '0 4px 14px rgba(239,68,68,0.3)',
                                }}
                            >
                                <Send size={15} /> {loading ? 'জমা হচ্ছে...' : 'রিপোর্ট পাঠান'}
                            </motion.button>
                        </form>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
