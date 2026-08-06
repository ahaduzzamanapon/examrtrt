import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet, ArrowDownCircle, ArrowUpCircle, Clock,
    CheckCircle, XCircle, ChevronRight, Plus, Minus,
} from 'lucide-react';
import MobileLayout from '@/Layouts/MobileLayout';

const METHODS = [
    { id: 'bkash',  label: 'বিকাশ',  emoji: '🟣', color: '#e91e8c' },
    { id: 'nagad',  label: 'নগদ',   emoji: '🟠', color: '#f26722' },
    { id: 'rocket', label: 'রকেট',  emoji: '🟣', color: '#8b2fc9' },
];

const STATUS = {
    pending:  { label: 'পেন্ডিং',  color: '#f59e0b', icon: Clock },
    approved: { label: 'সম্পন্ন', color: '#10b981', icon: CheckCircle },
    rejected: { label: 'বাতিল',   color: '#ef4444', icon: XCircle },
};

function TxRow({ tx }) {
    const isCredit = tx.type === 'deposit' || tx.type === 'prize' || tx.type === 'refund';
    const s = STATUS[tx.status] ?? STATUS.pending;
    const SIcon = s.icon;
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
            <div style={{
                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                background: isCredit ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                {isCredit
                    ? <ArrowDownCircle size={17} color="#34d399" />
                    : <ArrowUpCircle size={17} color="#f87171" />
                }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'white', fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>
                    {tx.payment_method ? `${tx.payment_method} ${tx.type}` : tx.type}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 2 }}>
                    {tx.trx_id && `TrxID: ${tx.trx_id} · `}
                    {new Date(tx.created_at).toLocaleDateString('bn-BD')}
                </div>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={{ color: isCredit ? '#34d399' : '#f87171', fontWeight: 800, fontSize: 14 }}>
                    {isCredit ? '+' : '-'}৳{Math.abs(tx.net_amount ?? tx.gross_amount ?? 0)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end', marginTop: 2 }}>
                    <SIcon size={10} style={{ color: s.color }} />
                    <span style={{ color: s.color, fontSize: 10, fontWeight: 600 }}>{s.label}</span>
                </div>
            </div>
        </div>
    );
}

export default function WalletIndex({ balance = 0, transactions = [] }) {
    const { auth } = usePage().props;
    const [tab, setTab] = useState('main'); // main | deposit | withdraw

    // Deposit form
    const depForm = useForm({
        payment_method: 'bkash',
        gross_amount:   '',
        trx_id:         '',
        payment_number: '',
    });

    // Withdraw form
    const wdForm = useForm({
        payment_method:  'bkash',
        gross_amount:    '',
        payment_number:  '',
    });

    const submitDeposit = (e) => {
        e.preventDefault();
        depForm.post(route('wallet.deposit'), {
            onSuccess: () => { depForm.reset(); setTab('main'); },
        });
    };

    const submitWithdraw = (e) => {
        e.preventDefault();
        wdForm.post(route('wallet.withdraw'), {
            onSuccess: () => { wdForm.reset(); setTab('main'); },
        });
    };

    const inputStyle = {
        width: '100%', padding: '11px 14px', borderRadius: 10,
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
        color: 'white', fontSize: 14, outline: 'none',
    };
    const labelStyle = {
        color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700,
        letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6,
    };

    return (
        <MobileLayout title="ওয়ালেট">
            <Head title="ওয়ালেট" />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            <AnimatePresence mode="wait">

                {/* ── MAIN TAB ─────────────────────────────────────────────── */}
                {tab === 'main' && (
                    <motion.div key="main" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

                        {/* Balance card */}
                        <div style={{
                            background: 'linear-gradient(135deg,rgba(77,111,255,0.25),rgba(124,58,237,0.2))',
                            border: '1px solid rgba(77,111,255,0.3)',
                            borderRadius: 20, padding: '28px 24px', marginBottom: 20, textAlign: 'center',
                        }}>
                            <Wallet size={28} style={{ color: '#93b4ff', marginBottom: 10 }} />
                            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                মোট ব্যালেন্স
                            </div>
                            <div style={{ color: 'white', fontWeight: 900, fontSize: 38, marginTop: 6 }}>
                                ৳{parseFloat(balance).toFixed(2)}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setTab('deposit')}
                                style={{
                                    padding: '16px', borderRadius: 14, border: 'none', cursor: 'pointer',
                                    background: 'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(5,150,105,0.15))',
                                    border: '1px solid rgba(16,185,129,0.3)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                                }}>
                                <ArrowDownCircle size={24} color="#34d399" />
                                <span style={{ color: '#34d399', fontWeight: 700, fontSize: 13 }}>ডিপোজিট</span>
                                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>বিকাশ / নগদ / রকেট</span>
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setTab('withdraw')}
                                style={{
                                    padding: '16px', borderRadius: 14, border: 'none', cursor: 'pointer',
                                    background: 'linear-gradient(135deg,rgba(239,68,68,0.15),rgba(220,38,38,0.1))',
                                    border: '1px solid rgba(239,68,68,0.25)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                                }}>
                                <ArrowUpCircle size={24} color="#f87171" />
                                <span style={{ color: '#f87171', fontWeight: 700, fontSize: 13 }}>উইথড্র</span>
                                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>সর্বনিম্ন ৫০ টাকা</span>
                            </motion.button>
                        </div>

                        {/* Transaction history */}
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '16px 18px' }}>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                                লেনদেনের ইতিহাস
                            </div>
                            {transactions.length === 0 ? (
                                <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, padding: '24px 0', textAlign: 'center' }}>
                                    এখনো কোনো লেনদেন নেই
                                </div>
                            ) : (
                                transactions.map(tx => <TxRow key={tx.id} tx={tx} />)
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ── DEPOSIT TAB ───────────────────────────────────────────── */}
                {tab === 'deposit' && (
                    <motion.div key="deposit" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                            <button onClick={() => setTab('main')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 20 }}>←</button>
                            <h2 style={{ color: 'white', fontWeight: 700, fontSize: 17, margin: 0 }}>ডিপোজিট করো</h2>
                        </div>

                        <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 14, padding: '14px 16px', marginBottom: 18, fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                            📌 বিকাশ/নগদ/রকেট থেকে টাকা পাঠাও <strong style={{ color: 'white' }}>01XXXXXXXXXX</strong> নম্বরে।
                            তারপর নিচের ফর্মে TrxID দিয়ে জমা দাও। Admin verify করলে ব্যালেন্স যোগ হবে।
                        </div>

                        <form onSubmit={submitDeposit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Method */}
                            <div>
                                <label style={labelStyle}>পেমেন্ট মেথড</label>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {METHODS.map(m => (
                                        <button key={m.id} type="button"
                                            onClick={() => depForm.setData('payment_method', m.id)}
                                            style={{
                                                flex: 1, padding: '10px 6px', borderRadius: 12, cursor: 'pointer',
                                                background: depForm.data.payment_method === m.id ? `${m.color}22` : 'rgba(255,255,255,0.04)',
                                                border: `1px solid ${depForm.data.payment_method === m.id ? m.color + '66' : 'rgba(255,255,255,0.1)'}`,
                                                color: depForm.data.payment_method === m.id ? m.color : 'rgba(255,255,255,0.4)',
                                                fontWeight: 700, fontSize: 12, textAlign: 'center',
                                            }}
                                        >
                                            <div style={{ fontSize: 20 }}>{m.emoji}</div>
                                            {m.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Amount */}
                            <div>
                                <label style={labelStyle}>পরিমাণ (৳) — সর্বনিম্ন ২০</label>
                                <input type="number" style={inputStyle} min={20} placeholder="0.00"
                                    value={depForm.data.gross_amount}
                                    onChange={e => depForm.setData('gross_amount', e.target.value)} />
                                {depForm.errors.gross_amount && <p style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>{depForm.errors.gross_amount}</p>}
                            </div>

                            {/* Sender number */}
                            <div>
                                <label style={labelStyle}>প্রেরকের নম্বর</label>
                                <input type="text" style={inputStyle} placeholder="01XXXXXXXXXX"
                                    value={depForm.data.payment_number}
                                    onChange={e => depForm.setData('payment_number', e.target.value)} />
                                {depForm.errors.payment_number && <p style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>{depForm.errors.payment_number}</p>}
                            </div>

                            {/* TrxID */}
                            <div>
                                <label style={labelStyle}>Transaction ID (TrxID)</label>
                                <input type="text" style={inputStyle} placeholder="8FG2X3K..."
                                    value={depForm.data.trx_id}
                                    onChange={e => depForm.setData('trx_id', e.target.value)} />
                                {depForm.errors.trx_id && <p style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>{depForm.errors.trx_id}</p>}
                            </div>

                            <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={depForm.processing}
                                style={{ padding: '14px', borderRadius: 14, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', fontWeight: 800, fontSize: 15 }}>
                                {depForm.processing ? 'জমা দেওয়া হচ্ছে...' : '✅ ডিপোজিট রিকোয়েস্ট জমা দাও'}
                            </motion.button>
                        </form>
                    </motion.div>
                )}

                {/* ── WITHDRAW TAB ──────────────────────────────────────────── */}
                {tab === 'withdraw' && (
                    <motion.div key="withdraw" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                            <button onClick={() => setTab('main')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 20 }}>←</button>
                            <h2 style={{ color: 'white', fontWeight: 700, fontSize: 17, margin: 0 }}>উইথড্র করো</h2>
                        </div>

                        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 14, padding: '14px 16px', marginBottom: 18, fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                            💰 বর্তমান ব্যালেন্স: <strong style={{ color: '#fcd34d' }}>৳{parseFloat(balance).toFixed(2)}</strong><br />
                            ⚠️ উইথড্র ফি: ২% কাটা হবে। সর্বনিম্ন ৫০৳।
                        </div>

                        <form onSubmit={submitWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Method */}
                            <div>
                                <label style={labelStyle}>পেমেন্ট মেথড</label>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {METHODS.map(m => (
                                        <button key={m.id} type="button"
                                            onClick={() => wdForm.setData('payment_method', m.id)}
                                            style={{
                                                flex: 1, padding: '10px 6px', borderRadius: 12, cursor: 'pointer',
                                                background: wdForm.data.payment_method === m.id ? `${m.color}22` : 'rgba(255,255,255,0.04)',
                                                border: `1px solid ${wdForm.data.payment_method === m.id ? m.color + '66' : 'rgba(255,255,255,0.1)'}`,
                                                color: wdForm.data.payment_method === m.id ? m.color : 'rgba(255,255,255,0.4)',
                                                fontWeight: 700, fontSize: 12, textAlign: 'center',
                                            }}
                                        >
                                            <div style={{ fontSize: 20 }}>{m.emoji}</div>
                                            {m.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Amount */}
                            <div>
                                <label style={labelStyle}>পরিমাণ (৳) — সর্বনিম্ন ৫০</label>
                                <input type="number" style={inputStyle} min={50} placeholder="0.00"
                                    value={wdForm.data.gross_amount}
                                    onChange={e => wdForm.setData('gross_amount', e.target.value)} />
                                {wdForm.errors.gross_amount && <p style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>{wdForm.errors.gross_amount}</p>}
                                {wdForm.data.gross_amount > 0 && (
                                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 5 }}>
                                        ২% ফি কাটলে পাবেন: ৳{(wdForm.data.gross_amount * 0.98).toFixed(2)}
                                    </div>
                                )}
                            </div>

                            {/* Account number */}
                            <div>
                                <label style={labelStyle}>প্রাপকের নম্বর (তোমার)</label>
                                <input type="text" style={inputStyle} placeholder="01XXXXXXXXXX"
                                    value={wdForm.data.payment_number}
                                    onChange={e => wdForm.setData('payment_number', e.target.value)} />
                                {wdForm.errors.payment_number && <p style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>{wdForm.errors.payment_number}</p>}
                            </div>

                            <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={wdForm.processing}
                                style={{ padding: '14px', borderRadius: 14, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', fontWeight: 800, fontSize: 15 }}>
                                {wdForm.processing ? 'প্রসেস হচ্ছে...' : '↑ উইথড্র রিকোয়েস্ট জমা দাও'}
                            </motion.button>
                        </form>
                    </motion.div>
                )}

            </AnimatePresence>
        </MobileLayout>
    );
}
