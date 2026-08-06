import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Share2, Copy, Check, Gift, ShoppingBag,
    Wallet, ArrowRight, Sparkles, AlertCircle, Clock, PlayCircle, X
} from 'lucide-react';
import MobileLayout from '@/Layouts/MobileLayout';

export default function TokenStoreIndex({
    tokenBalance = 0,
    walletBalance = 0,
    packages = [],
    referralCode = '',
    referralLink = '',
    status = {},
    adViewActive = true,
    adViewAmount = 5
}) {
    const { errors, flash } = usePage().props;
    const [copied, setCopied] = useState(false);
    const [buyingId, setBuyingId] = useState(null);
    const [adModal, setAdModal] = useState(false);
    const [adTimer, setAdTimer] = useState(5);
    const [adClaimable, setAdClaimable] = useState(false);

    const copyReferral = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleBuy = (pkgId) => {
        setBuyingId(pkgId);
        router.post(route('tokens.buy'), { package_id: pkgId }, {
            onFinish: () => setBuyingId(null),
        });
    };

    const handleClaimDaily = () => {
        router.post(route('tokens.daily-claim'));
    };

    const startWatchAd = () => {
        setAdTimer(5);
        setAdClaimable(false);
        setAdModal(true);
    };

    useEffect(() => {
        let interval = null;
        if (adModal && adTimer > 0) {
            interval = setInterval(() => {
                setAdTimer(t => {
                    if (t <= 1) {
                        clearInterval(interval);
                        setAdClaimable(true);
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [adModal, adTimer]);

    const claimAdReward = () => {
        setAdModal(false);
        router.post(route('tokens.watch-ad'));
    };

    return (
        <MobileLayout title="টোকেন স্টোর">
            <Head title="টোকেন স্টোর — ExamArena" />

            <div style={{ padding: '16px', maxWidth: 520, margin: '0 auto', paddingBottom: 80 }}>

                {/* Balances Card */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(124,58,237,0.15))',
                    border: '1px solid rgba(245,158,11,0.3)', borderRadius: 20, padding: '20px',
                    marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    boxShadow: '0 8px 24px rgba(245,158,11,0.15)',
                }}>
                    <div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            আপনার টোকেন ব্যালেন্স
                        </div>
                        <div style={{ color: '#fbbf24', fontWeight: 900, fontSize: 32, marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                            ⚡ {tokenBalance} <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>টোকেন</span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 16 }}>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                            ওয়ালেট ব্যালেন্স
                        </div>
                        <div style={{ color: 'white', fontWeight: 800, fontSize: 20, marginTop: 4 }}>
                            ৳{parseFloat(walletBalance).toFixed(2)}
                        </div>
                        <Link href={route('wallet.index')} style={{ color: '#93b4ff', fontSize: 11, fontWeight: 700, textDecoration: 'none', marginTop: 2, display: 'block' }}>
                            + রিচার্জ করো →
                        </Link>
                    </div>
                </div>

                {errors.wallet && (
                    <div style={{ padding: '12px 14px', borderRadius: 12, marginBottom: 16, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AlertCircle size={16} /> {errors.wallet}
                    </div>
                )}
                {errors.bonus && (
                    <div style={{ padding: '12px 14px', borderRadius: 12, marginBottom: 16, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Clock size={16} /> {errors.bonus}
                    </div>
                )}

                {/* ── REFER & EARN FREE TOKENS ─────────────────────────────────── */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(77,111,255,0.15), rgba(124,58,237,0.1))',
                    border: '1px solid rgba(77,111,255,0.25)', borderRadius: 20, padding: '18px',
                    marginBottom: 24,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(77,111,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Gift size={20} color="#93b4ff" />
                        </div>
                        <div>
                            <h3 style={{ color: 'white', fontWeight: 800, fontSize: 15, margin: 0 }}>
                                রেফার করে ফ্রিতে টোকেন আয় করুন!
                            </h3>
                            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, margin: 0 }}>
                                প্রতিটি সফল রেফারে আপনি এবং আপনার বন্ধু দুজনেই পাবেন +১০টি টোকেন ⚡
                            </p>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8, marginTop: 12,
                        background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 12, padding: '8px 12px',
                    }}>
                        <input
                            type="text"
                            readOnly
                            value={referralLink}
                            style={{ flex: 1, background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 12, outline: 'none' }}
                        />
                        <button
                            onClick={copyReferral}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8,
                                border: 'none', background: copied ? '#10b981' : '#4d6fff', color: 'white',
                                fontWeight: 700, fontSize: 12, cursor: 'pointer', flexShrink: 0,
                            }}
                        >
                            {copied ? <Check size={13} /> : <Copy size={13} />}
                            {copied ? 'কপি হয়েছে' : 'কপি করো'}
                        </button>
                    </div>
                </div>

                {/* ── DAILY FREE BONUS ───────────────────────────────────────── */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 18, padding: '16px', marginBottom: 24,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Sparkles size={24} color="#f59e0b" />
                        <div>
                            <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>দৈনিক ফ্রি বোনাস</div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>প্রতিদিন অ্যাপে আসলেই +১০ টোকেন ফ্রি</div>
                        </div>
                    </div>
                    <button
                        onClick={handleClaimDaily}
                        disabled={status.daily_claimed}
                        style={{
                            padding: '8px 16px', borderRadius: 12, border: 'none',
                            background: status.daily_claimed ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg,#f59e0b,#d97706)',
                            color: status.daily_claimed ? 'rgba(255,255,255,0.3)' : 'white',
                            fontWeight: 800, fontSize: 12, cursor: status.daily_claimed ? 'default' : 'pointer',
                        }}
                    >
                        {status.daily_claimed ? 'ক্লেইমড ✓' : 'ক্লেইম করো 🎁'}
                    </button>
                </div>

                {/* ── BUY TOKEN PACKAGES ──────────────────────────────────────── */}
                <div style={{ color: 'white', fontWeight: 800, fontSize: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShoppingBag size={18} color="#93b4ff" /> টোকেন প্যাকেজসমূহ
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {packages.map((pkg) => (
                        <motion.div
                            key={pkg.id}
                            whileHover={{ y: -2 }}
                            style={{
                                padding: '18px 20px', borderRadius: 18,
                                background: 'rgba(255,255,255,0.04)',
                                border: pkg.badge ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.08)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                position: 'relative', overflow: 'hidden',
                            }}
                        >
                            {pkg.badge && (
                                <div style={{
                                    position: 'absolute', top: 0, right: 0, background: '#f59e0b', color: 'black',
                                    fontWeight: 900, fontSize: 9, padding: '2px 10px', borderBottomLeftRadius: 10,
                                    textTransform: 'uppercase',
                                }}>
                                    {pkg.badge}
                                </div>
                            )}

                            <div>
                                <div style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>
                                    {pkg.name}
                                </div>
                                <div style={{ color: '#fbbf24', fontWeight: 900, fontSize: 20, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    ⚡ {pkg.tokens} <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>টোকেন</span>
                                </div>
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleBuy(pkg.id)}
                                disabled={buyingId === pkg.id}
                                style={{
                                    padding: '10px 18px', borderRadius: 12, border: 'none',
                                    background: 'linear-gradient(135deg,#4d6fff,#7c3aed)',
                                    color: 'white', fontWeight: 800, fontSize: 14, cursor: 'pointer',
                                    boxShadow: '0 4px 14px rgba(77,111,255,0.3)',
                                }}
                            >
                                {buyingId === pkg.id ? 'প্রসেস হচ্ছে...' : `৳${pkg.price} টাকা`}
                            </motion.button>
                        </motion.div>
                    ))}
                </div>

            </div>
        </MobileLayout>
    );
}
