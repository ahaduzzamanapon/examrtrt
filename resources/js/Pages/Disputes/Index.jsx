import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Flag, Clock, CheckCircle2, XCircle, AlertCircle, HelpCircle } from 'lucide-react';
import MobileLayout from '@/Layouts/MobileLayout';

const STATUS = {
    PENDING:  { label: 'প্রক্রিয়াকধীন', color: '#f59e0b', icon: Clock },
    RESOLVED: { label: 'সমাধানকৃত',   color: '#10b981', icon: CheckCircle2 },
    REJECTED: { label: 'বাতিল',       color: '#ef4444', icon: XCircle },
};

export default function DisputesIndex({ disputes = [] }) {
    return (
        <MobileLayout title="আমার রিপোর্টসমূহ">
            <Head title="আমার প্রশ্ন রিপোর্ট — ExamArena" />

            <div style={{ padding: '16px', maxWidth: 520, margin: '0 auto', paddingBottom: 80 }}>

                {/* Banner Card */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(239,68,68,0.18), rgba(245,158,11,0.1))',
                    border: '1px solid rgba(239,68,68,0.25)', borderRadius: 20, padding: '20px',
                    marginBottom: 20,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: '50%', background: 'rgba(239,68,68,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                            <Flag size={22} color="#f87171" />
                        </div>
                        <div>
                            <h2 style={{ color: 'white', fontWeight: 900, fontSize: 19, margin: 0 }}>
                                প্রশ্ন রিপোর্ট হিস্ট্রি
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: '4px 0 0' }}>
                                ভুল বা অসংগতিপূর্ণ যেসকল প্রশ্ন আপনি রিপোর্ট করেছেন তার অবস্থা দেখুন
                            </p>
                        </div>
                    </div>
                </div>

                {/* Disputes List */}
                {disputes.length === 0 ? (
                    <div style={{
                        padding: '40px 20px', textAlign: 'center', borderRadius: 18,
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                    }}>
                        <div style={{ fontSize: 36, marginBottom: 8 }}>🚩</div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>আপনি এখনো কোনো প্রশ্ন রিপোর্ট করেননি</div>
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 4 }}>
                            পরীক্ষা বা প্র্যাকটিস করার সময় কোনো প্রশ্নে ভুল থাকলে তা ফ্ল্যাগ বাটনে ক্লিক করে রিপোর্ট করতে পারবেন।
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {disputes.map((d) => {
                            const st = STATUS[d.status] || STATUS.PENDING;
                            const Icon = st.icon;
                            return (
                                <motion.div
                                    key={d.id}
                                    style={{
                                        padding: '16px', borderRadius: 16,
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <span style={{
                                            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800,
                                            background: `${st.color}20`, color: st.color, border: `1px solid ${st.color}40`,
                                            display: 'flex', alignItems: 'center', gap: 4,
                                        }}>
                                            <Icon size={12} /> {st.label}
                                        </span>
                                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
                                            {new Date(d.created_at).toLocaleDateString('bn-BD')}
                                        </span>
                                    </div>

                                    {/* Reported Question Text */}
                                    <div style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 8, lineHeight: 1.5 }}>
                                        {d.question?.question_text || 'প্রশ্নটি মুছে ফেলা হয়েছে'}
                                    </div>

                                    {/* User Report Reason */}
                                    <div style={{
                                        padding: '10px 12px', borderRadius: 10,
                                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                                        color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: d.admin_note ? 8 : 0,
                                    }}>
                                        💬 <strong style={{ color: 'rgba(255,255,255,0.9)' }}>রিপোর্টের কারণ:</strong> {d.report_reason}
                                    </div>

                                    {/* Admin Note */}
                                    {d.admin_note && (
                                        <div style={{
                                            padding: '10px 12px', borderRadius: 10,
                                            background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)',
                                            color: '#c084fc', fontSize: 12,
                                        }}>
                                            👑 <strong>অ্যাডমিন নোট:</strong> {d.admin_note}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}

            </div>
        </MobileLayout>
    );
}
