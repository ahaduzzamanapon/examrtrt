import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, Key, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

const GEMINI_MODELS = [
    {
        id: 'gemini-2.5-flash-lite',
        label: 'Gemini 2.5 Flash-Lite',
        desc: 'সবচেয়ে দ্রুত উত্তর',
        badge: 'FASTEST',
        badgeColor: '#34d399',
        icon: '⚡',
        isNew: true,
    },
    {
        id: 'gemini-2.5-flash',
        label: 'Gemini 2.5 Flash',
        desc: 'সর্বোচ্চ সহায়তা, সুষম',
        badge: 'RECOMMENDED',
        badgeColor: '#4d6fff',
        icon: '🔥',
        isNew: true,
    },
    {
        id: 'gemini-2.5-pro',
        label: 'Gemini 2.5 Pro',
        desc: 'Extended thinking, জটিল সমস্যা',
        badge: 'POWERFUL',
        badgeColor: '#c084fc',
        icon: '🧠',
        isNew: false,
    },
    {
        id: 'gemini-2.0-flash',
        label: 'Gemini 2.0 Flash',
        desc: 'দ্রুত ও নির্ভরযোগ্য',
        badge: 'STABLE',
        badgeColor: '#fbbf24',
        icon: '✨',
        isNew: false,
    },
    {
        id: 'gemini-2.0-flash-lite',
        label: 'Gemini 2.0 Flash-Lite',
        desc: 'হালকা, কম cost',
        badge: 'LITE',
        badgeColor: '#94a3b8',
        icon: '🪶',
        isNew: false,
    },
    {
        id: 'gemini-1.5-pro',
        label: 'Gemini 1.5 Pro',
        desc: 'গণিত ও কোড বিশেষজ্ঞ',
        badge: 'PRO',
        badgeColor: '#f87171',
        icon: '🔬',
        isNew: false,
    },
    {
        id: 'gemini-1.5-flash',
        label: 'Gemini 1.5 Flash',
        desc: 'পুরনো Flash সংস্করণ',
        badge: 'LEGACY',
        badgeColor: '#64748b',
        icon: '💨',
        isNew: false,
    },
];

export default function AdminSettings({ geminiKeys, geminiModel }) {
    const { flash } = usePage().props;
    const [keys, setKeys]   = useState(Array.isArray(geminiKeys) ? geminiKeys : []);
    const [model, setModel] = useState(geminiModel ?? 'gemini-2.5-flash');
    const [newKey, setNewKey] = useState('');
    const [saving, setSaving] = useState(false);

    const addKey = () => {
        const k = newKey.trim();
        if (!k || keys.includes(k)) return;
        setKeys([...keys, k]);
        setNewKey('');
    };

    const removeKey = (i) => setKeys(keys.filter((_, idx) => idx !== i));

    const save = async () => {
        setSaving(true);
        const csrf = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
        await fetch(route('admin.settings.save'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf, 'Accept': 'application/json' },
            body: JSON.stringify({ gemini_keys: keys, gemini_model: model }),
        });
        setSaving(false);
        window.location.reload();
    };

    const inp = {
        width: '100%', padding: '10px 14px', borderRadius: 10,
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
        color: 'white', fontSize: 13, outline: 'none',
    };

    return (
        <AdminLayout title="Settings">
            <Head title="Settings — Admin" />

            {/* Flash */}
            <AnimatePresence>
                {flash?.success && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', marginBottom: 18, fontSize: 13 }}>
                        <CheckCircle size={14} /> {flash.success}
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ maxWidth: 620 }}>

                {/* Gemini Model */}
                <div style={{ padding: '20px 22px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <Zap size={16} color="#fcd34d" />
                        <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Gemini Model</span>
                        <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
                            selected: <code style={{ color: '#fbbf24' }}>{model}</code>
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {GEMINI_MODELS.map(m => {
                            const isSelected = model === m.id;
                            return (
                                <motion.button
                                    key={m.id}
                                    onClick={() => setModel(m.id)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        padding: '12px 14px', borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                                        border: `1.5px solid ${isSelected ? m.badgeColor : 'rgba(255,255,255,0.08)'}`,
                                        background: isSelected ? `${m.badgeColor}12` : 'rgba(255,255,255,0.03)',
                                        transition: 'all 0.15s', position: 'relative', overflow: 'hidden',
                                    }}
                                >
                                    {/* Selected tick */}
                                    {isSelected && (
                                        <div style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: '50%', background: m.badgeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>✓</div>
                                    )}

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                                        <span style={{ fontSize: 16 }}>{m.icon}</span>
                                        <span style={{ color: 'white', fontWeight: 700, fontSize: 12 }}>{m.label}</span>
                                        {m.isNew && (
                                            <span style={{ padding: '1px 6px', borderRadius: 6, background: 'rgba(52,211,153,0.2)', color: '#34d399', fontSize: 9, fontWeight: 700 }}>NEW</span>
                                        )}
                                    </div>

                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 6 }}>{m.desc}</div>

                                    <span style={{ padding: '2px 7px', borderRadius: 6, background: `${m.badgeColor}18`, color: m.badgeColor, fontSize: 9, fontWeight: 700 }}>
                                        {m.badge}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Gemini API Keys */}
                <div style={{ padding: '20px 22px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Key size={16} color="#93b4ff" />
                        <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Gemini API Keys</span>
                        <span style={{ marginLeft: 'auto', padding: '2px 8px', borderRadius: 10, background: 'rgba(77,111,255,0.15)', color: '#93b4ff', fontSize: 11 }}>
                            {keys.length} টি key · Round-robin
                        </span>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 14 }}>
                        একাধিক key দিলে rate limit এড়ানো যাবে। Gemini Console থেকে key নিন।
                    </p>

                    {/* Existing keys */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                        {keys.map((k, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, background: 'rgba(77,111,255,0.08)', border: '1px solid rgba(77,111,255,0.15)' }}>
                                <Key size={12} color="#93b4ff" style={{ flexShrink: 0 }} />
                                <span style={{ flex: 1, color: '#93b4ff', fontSize: 12, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {k.slice(0, 8)}•••••••••••••{k.slice(-4)}
                                </span>
                                <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10 }}>Key {i + 1}</span>
                                <button onClick={() => removeKey(i)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 2 }}>
                                    <Trash2 size={13} />
                                </button>
                            </motion.div>
                        ))}
                        {keys.length === 0 && (
                            <div style={{ padding: '14px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 12, borderRadius: 10, border: '1px dashed rgba(255,255,255,0.08)' }}>
                                কোনো API key নেই
                            </div>
                        )}
                    </div>

                    {/* Add new key */}
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input
                            type="password"
                            value={newKey}
                            onChange={e => setNewKey(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addKey()}
                            placeholder="নতুন Gemini API Key paste করুন..."
                            style={{ ...inp, flex: 1 }}
                        />
                        <button onClick={addKey}
                            style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(77,111,255,0.2)', border: '1px solid rgba(77,111,255,0.3)', color: '#93b4ff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
                            <Plus size={14} /> Add
                        </button>
                    </div>
                </div>

                {/* Save */}
                <button onClick={save} disabled={saving}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, background: saving ? 'rgba(77,111,255,0.3)' : 'linear-gradient(135deg,#4d6fff,#7c3aed)', color: 'white', fontWeight: 700, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14 }}>
                    <Save size={15} />
                    {saving ? 'সেভ হচ্ছে...' : 'সেভ করো'}
                </button>
            </div>
        </AdminLayout>
    );
}
