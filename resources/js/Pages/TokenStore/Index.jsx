import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Share2, Copy, Check, Gift, ShoppingBag,
    Wallet, ArrowRight, Sparkles, AlertCircle, Clock, PlayCircle, X
} from 'lucide-react';
import MobileLayout from '@/Layouts/MobileLayout';

function AdsterraBanner({ scriptCode }) {
    const defaultCode = `
        <style>body{margin:0;padding:0;display:flex;justify-content:center;align-items:center;background:transparent;}</style>
        <script>
          atOptions = {
            'key' : 'b7c4685fce9282287defd9cd0dd99097',
            'format' : 'iframe',
            'height' : 250,
            'width' : 300,
            'params' : {}
          };
        </script>
        <script src="https://www.highperformanceformat.com/b7c4685fce9282287defd9cd0dd99097/invoke.js"></script>
    `;
    const codeToRender = scriptCode || defaultCode;

    return (
        <iframe
            title="Adsterra Banner"
            srcDoc={codeToRender}
            style={{ width: 300, height: 250, border: 'none', overflow: 'hidden', margin: '0 auto', borderRadius: 12 }}
            scrolling="no"
        />
    );
}

export default function TokenStoreIndex({
    tokenBalance = 0,
    walletBalance = 0,
    packages = [],
    referralCode = '',
    referralLink = '',
    status = {},
    adViewActive = true,
    adViewAmount = 5,
    adsterraScript = ''
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

                {/* ── HEADER BALANCE CARD ───────────────────────────────────────── */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(77,111,255,0.2), rgba(124,58,237,0.2))',
                    border: '1px solid rgba(77,111,255,0.3)', borderRadius: 22, padding: '20px',
                    marginBottom: 20, boxShadow: '0 8px 24px rgba(77,111,255,0.15)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600 }}>বর্তমান ব্যালেন্স</div>
                            <div style={{ color: '#fbbf24', fontWeight: 900, fontSize: 32, display: 'flex', alignItems: 'center', gap: 8 }}>
                                ⚡ {tokenBalance} <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>টোকেন</span>
                            </div>
                        </div>
                        <div style={{
                            width: 52, height: 52, borderRadius: '50%', background: 'rgba(245,158,11,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(245,158,11,0.4)',
                        }}>
                            <Zap size={26} color="#fbbf24" />
                        </div>
                    </div>

                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px', borderRadius: 12, background: 'rgba(0,0,0,0.25)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'white', fontSize: 13, fontWeight: 600 }}>
                            <Wallet size={15} color="#34d399" /> ওয়ালেট ব্যালেন্স: ৳{walletBalance.toFixed(2)}
                        </div>
                        <Link href={route('wallet.index')} style={{ color: '#93b4ff', fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                            রিচার্জ করো <ArrowRight size={13} />
                        </Link>
                    </div>
                </div>

                {errors.bonus && (
                    <div style={{ padding: '12px 14px', borderRadius: 12, marginBottom: 16, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 13 }}>
                        ⚠️ {errors.bonus}
                    </div>
                )}

                {/* ── REFERRAL CARD ───────────────────────────────────────────── */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 20, padding: '18px 20px', marginBottom: 20,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <Gift size={22} color="#a78bfa" />
                        <div>
                            <div style={{ color: 'white', fontWeight: 800, fontSize: 15 }}>রেফারেল বোনাস</div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>প্রতি সফল রেফারে উভয়ে পাবে +১০ টোকেন!</div>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                        background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.09)',
                    }}>
                        <input
                            type="text" readOnly value={referralLink}
                            style={{ background: 'none', border: 'none', color: '#93b4ff', fontSize: 12, width: '100%', outline: 'none', fontWeight: 600 }}
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
                    borderRadius: 18, padding: '16px', marginBottom: 14,
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

                {/* ── REWARDED AD WATCH CARD ──────────────────────────────────── */}
                {adViewActive && (
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.08))',
                        border: '1px solid rgba(16,185,129,0.3)',
                        borderRadius: 18, padding: '16px', marginBottom: 24,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <PlayCircle size={26} color="#34d399" />
                            <div>
                                <div style={{ color: 'white', fontWeight: 800, fontSize: 14 }}>ভিডিও বিজ্ঞাপন ফ্রি টোকেন 🎬</div>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>বিজ্ঞাপন দেখে সহজে পেয়ে যান +{adViewAmount} টোকেন</div>
                            </div>
                        </div>
                        <button
                            onClick={startWatchAd}
                            style={{
                                padding: '9px 16px', borderRadius: 12, border: 'none',
                                background: 'linear-gradient(135deg,#10b981,#059669)',
                                color: 'white', fontWeight: 800, fontSize: 12, cursor: 'pointer',
                                boxShadow: '0 4px 14px rgba(16,185,129,0.3)', flexShrink: 0,
                            }}
                        >
                            বিজ্ঞাপন দেখুন 🎬
                        </button>
                    </div>
                )}

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

            {/* ── ADSTERRA REWARDED AD MODAL ────────────────────────────────────── */}
            <AnimatePresence>
                {adModal && (
                    <div style={{
                        position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.85)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
                        backdropFilter: 'blur(10px)',
                    }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{
                                width: '100%', maxWidth: 360, borderRadius: 24, padding: 20,
                                background: '#0d1127', border: '1px solid rgba(52,211,153,0.4)',
                                color: 'white', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                <span style={{ color: '#34d399', fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    🎬 স্পন্সরড বিজ্ঞাপন
                                </span>
                                {adClaimable && (
                                    <button onClick={() => setAdModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                                        <X size={20} />
                                    </button>
                                )}
                            </div>

                            {/* Banner container */}
                            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 14, padding: '10px 0', marginBottom: 16, minHeight: 255 }}>
                                <AdsterraBanner scriptCode={adsterraScript} />
                            </div>

                            {/* Timer / Claim Button */}
                            {!adClaimable ? (
                                <div style={{
                                    padding: '12px', borderRadius: 14, background: 'rgba(255,255,255,0.05)',
                                    color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                }}>
                                    <Clock size={16} color="#fbbf24" />
                                    টোকেন আনলক হতে বাকি: <span style={{ color: '#fbbf24', fontSize: 16, fontWeight: 900 }}>{adTimer}s</span>
                                </div>
                            ) : (
                                <button
                                    onClick={claimAdReward}
                                    style={{
                                        width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                                        background: 'linear-gradient(135deg,#10b981,#059669)',
                                        color: 'white', fontWeight: 900, fontSize: 15, cursor: 'pointer',
                                        boxShadow: '0 4px 18px rgba(16,185,129,0.4)',
                                    }}
                                >
                                    🎁 +{adViewAmount} টোকেন ক্লেইম করুন!
                                </button>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </MobileLayout>
    );
}
