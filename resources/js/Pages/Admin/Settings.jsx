import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, Key, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

const GEMINI_MODELS = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
];

export default function AdminSettings({ geminiKeys, geminiModel }) {
    const { flash } = usePage().props;
    const [keys, setKeys]   = useState(geminiKeys ?? []);
    const [model, setModel] = useState(geminiModel ?? 'gemini-2.0-flash');
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
                    </div>
                    <select value={model} onChange={e => setModel(e.target.value)}
                        style={{ ...inp, cursor: 'pointer' }}>
                        {GEMINI_MODELS.map(m => <option key={m} value={m} style={{ background: '#0c1025' }}>{m}</option>)}
                    </select>
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
