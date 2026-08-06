import { useRef, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Trash2, Edit3, ChevronLeft, ChevronRight,
         Upload, Sparkles, CheckCircle, AlertCircle, X, Save, ImagePlus } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { getSubjects, SUBJECTS_BY_GOAL } from '@/data/subjects';

const GOALS = [
    { value: 'bcs', label: 'BCS' }, { value: 'hsc', label: 'HSC' },
    { value: 'ssc', label: 'SSC' }, { value: 'medical', label: 'Medical' },
    { value: 'bank', label: 'Bank' }, { value: 'university', label: 'University' },
    { value: 'primary', label: 'Primary' }, { value: 'other', label: 'Other' },
];
const DIFFICULTIES = ['LOW', 'MEDIUM', 'HIGH'];
const INP = { width: '100%', padding: '9px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13, outline: 'none' };
const SEL = { ...INP, cursor: 'pointer' };

function DiffBadge({ level }) {
    const colors = { LOW: '#34d399', MEDIUM: '#fbbf24', HIGH: '#f87171' };
    return <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: `${colors[level] ?? '#94a3b8'}22`, color: colors[level] ?? '#94a3b8', border: `1px solid ${colors[level] ?? '#94a3b8'}44` }}>{level}</span>;
}

// ── Question Form Modal ───────────────────────────────────────────────────────
function QuestionModal({ initial, onClose }) {
    const isEdit = !!initial?.id;
    const [form, setForm] = useState(initial ?? { exam_goal: 'bcs', exam_type: '', board_year: '', subject: '', question_text: '', image_url: '', options: { a: '', b: '', c: '', d: '' }, correct_answer: 'a', explanation: '', difficulty_level: 'MEDIUM' });
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const setOpt = (k, v) => setForm(f => ({ ...f, options: { ...f.options, [k]: v } }));
    const submit = () => {
        if (isEdit) router.patch(route('admin.questions.update', initial.id), form, { onSuccess: onClose });
        else router.post(route('admin.questions.store'), form, { onSuccess: onClose });
    };
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: '#0c1025', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 24, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>{isEdit ? '✏️ প্রশ্ন সম্পাদনা' : '➕ নতুন প্রশ্ন'}</span>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={16} /></button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div><label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, display: 'block', marginBottom: 4 }}>পরীক্ষার লক্ষ্য *</label>
                        <select value={form.exam_goal} onChange={e => { set('exam_goal', e.target.value); set('subject', ''); }} style={SEL}>
                            {GOALS.map(g => <option key={g.value} value={g.value} style={{ background: '#0c1025' }}>{g.label}</option>)}
                        </select>
                    </div>
                    <div><label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, display: 'block', marginBottom: 4 }}>Difficulty *</label>
                        <select value={form.difficulty_level} onChange={e => set('difficulty_level', e.target.value)} style={SEL}>
                            {DIFFICULTIES.map(d => <option key={d} value={d} style={{ background: '#0c1025' }}>{d}</option>)}
                        </select>
                    </div>
                    <div><label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, display: 'block', marginBottom: 4 }}>Exam Type</label>
                        <input value={form.exam_type} onChange={e => set('exam_type', e.target.value)} placeholder="BCS, HSC 2024..." style={INP} />
                    </div>
                    <div><label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, display: 'block', marginBottom: 4 }}>Board Year</label>
                        <input value={form.board_year} onChange={e => set('board_year', e.target.value)} placeholder="৪৫তম বিসিএস প্রিলিমিনারি" style={INP} />
                    </div>
                </div>
                <div style={{ marginBottom: 10 }}><label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, display: 'block', marginBottom: 4 }}>পরীক্ষার বিষয় *</label>
                    <select value={form.subject} onChange={e => set('subject', e.target.value)} style={SEL}>
                        <option value="" style={{ background: '#0c1025' }}>-- বিষয় নির্বাচন করুন --</option>
                        {getSubjects(form.exam_goal).map(s => <option key={s} value={s} style={{ background: '#0c1025' }}>{s}</option>)}
                    </select>
                </div>
                <div style={{ marginBottom: 10 }}><label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, display: 'block', marginBottom: 4 }}>প্রশ্ন *</label>
                    <textarea value={form.question_text} onChange={e => set('question_text', e.target.value)} rows={3} placeholder="প্রশ্নটি বাংলায় লিখুন..." style={{ ...INP, resize: 'vertical' }} />
                </div>
                <div style={{ marginBottom: 10 }}><label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, display: 'block', marginBottom: 4 }}>বিকল্পগুলো *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {['a', 'b', 'c', 'd'].map(opt => (
                            <div key={opt} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                <span style={{ color: form.correct_answer === opt ? '#34d399' : 'rgba(255,255,255,0.3)', fontWeight: 700, fontSize: 13, width: 16 }}>{opt.toUpperCase()}.</span>
                                <input value={form.options?.[opt] ?? ''} onChange={e => setOpt(opt, e.target.value)} placeholder={`Option ${opt.toUpperCase()}`} style={{ ...INP, flex: 1 }} />
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ marginBottom: 10 }}><label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, display: 'block', marginBottom: 4 }}>সঠিক উত্তর *</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {['a', 'b', 'c', 'd'].map(opt => (
                            <button key={opt} type="button" onClick={() => set('correct_answer', opt)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1px solid ${form.correct_answer === opt ? '#34d399' : 'rgba(255,255,255,0.1)'}`, background: form.correct_answer === opt ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.04)', color: form.correct_answer === opt ? '#34d399' : 'rgba(255,255,255,0.4)', fontWeight: 700, cursor: 'pointer' }}>{opt.toUpperCase()}</button>
                        ))}
                    </div>
                </div>
                <div style={{ marginBottom: 16 }}><label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, display: 'block', marginBottom: 4 }}>ব্যাখ্যা (Explanation)</label>
                    <textarea value={form.explanation} onChange={e => set('explanation', e.target.value)} rows={2} placeholder="সঠিক উত্তরের ব্যাখ্যা..." style={{ ...INP, resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={submit} style={{ flex: 1, padding: '11px', borderRadius: 11, background: 'linear-gradient(135deg,#4d6fff,#7c3aed)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <Save size={14} /> {isEdit ? 'আপডেট করো' : 'সেভ করো'}
                    </button>
                    <button onClick={onClose} style={{ padding: '11px 18px', borderRadius: 11, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontWeight: 600 }}>বাতিল</button>
                </div>
            </motion.div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminQuestions({ questions, filters, stats }) {
    const { flash } = usePage().props;
    const [tab, setTab]           = useState('list');
    const [modal, setModal]       = useState(null);
    const [search, setSearch]     = useState(filters?.q ?? '');
    const [goalFilter, setGoal]   = useState(filters?.goal ?? '');
    const [jsonText, setJsonText] = useState('');
    const [importGoal, setImportGoal] = useState('bcs');
    const [importing, setImporting]   = useState(false);

    // AI Generate
    const [aiForm, setAiForm]         = useState({ exam_goal: '', subject: '', board_year: '', count: 1, difficulty: 'MEDIUM' });
    const [generating, setGenerating] = useState(false);
    const [aiResult, setAiResult]     = useState(null);
    const [aiError, setAiError]       = useState('');
    const [selected, setSelected]     = useState([]);

    // Queue
    const [queue, setQueue]     = useState([]);
    const [qDone, setQDone]     = useState(0);
    const [qCurrent, setQCurrent] = useState('');
    const [qRunning, setQRunning] = useState(false);
    const [qSaved, setQSaved]   = useState(0);
    const qStop = useRef(false);

    // Image Extract
    const imgRef = useRef(null);
    const [imgGoal, setImgGoal]         = useState('bcs');
    const [imgPreview, setImgPreview]   = useState(null);
    const [imgFile, setImgFile]         = useState(null);
    const [imgLoading, setImgLoading]   = useState(false);
    const [imgResult, setImgResult]     = useState(null);
    const [imgError, setImgError]       = useState('');
    const [imgSelected, setImgSelected] = useState([]);

    const csrf = () => document.querySelector('meta[name="csrf-token"]')?.content ?? '';

    const doSearch = e => { e.preventDefault(); router.get(route('admin.questions'), { q: search, goal: goalFilter }, { preserveState: true }); };
    const doDelete = q => { if (!confirm(`"${q.question_text.slice(0, 40)}..." মুছে ফেলতে চাও?`)) return; router.delete(route('admin.questions.destroy', q.id)); };

    const doImport = async () => {
        setImporting(true);
        const res = await fetch(route('admin.questions.import'), { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() }, body: JSON.stringify({ json: jsonText, exam_goal: importGoal }) });
        setImporting(false);
        if (res.ok) { setJsonText(''); router.reload(); } else { const d = await res.json().catch(() => ({})); alert(d?.message ?? 'Import failed'); }
    };

    const doGenerate = async () => {
        setGenerating(true); setAiResult(null); setAiError(''); setSelected([]);
        const res = await fetch(route('admin.questions.ai'), { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() }, body: JSON.stringify({ ...aiForm, count: aiForm.count || 1 }) });
        const data = await res.json().catch(() => ({}));
        setGenerating(false);
        if (!res.ok) { setAiError(data?.error ?? 'Failed'); return; }
        setAiResult(data.questions ?? []);
        setSelected((data.questions ?? []).map((_, i) => i));
    };

    const doSaveAi = async (result, selectedIdx, goal) => {
        const toSave = selectedIdx.map(i => result[i]);
        const res = await fetch(route('admin.questions.bulk'), { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() }, body: JSON.stringify({ questions: toSave, exam_goal: goal || 'other' }) });
        const data = await res.json().catch(() => ({}));
        if (res.ok) { setAiResult(null); setImgResult(null); router.reload(); alert(`✅ ${data.saved} টি প্রশ্ন সেভ হয়েছে।`); }
    };

    const startQueue = async (items) => {
        if (!items.length) return;
        setQueue(items); setQDone(0); setQSaved(0); setQRunning(true); qStop.current = false;
        for (let i = 0; i < items.length; i++) {
            if (qStop.current) break;
            const { exam_goal, subject } = items[i];
            setQDone(i); setQCurrent(`${exam_goal.toUpperCase()} → ${subject}`);
            try {
                const res = await fetch(route('admin.questions.ai'), { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() }, body: JSON.stringify({ exam_goal, subject, count: aiForm.count || 1, difficulty: aiForm.difficulty || 'MEDIUM', board_year: aiForm.board_year }) });
                const data = await res.json().catch(() => ({}));
                if (res.ok && data.questions?.length > 0) {
                    await fetch(route('admin.questions.bulk'), { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() }, body: JSON.stringify({ questions: data.questions, exam_goal }) });
                    setQSaved(s => s + 1);
                }
            } catch {}
            await new Promise(r => setTimeout(r, 1200));
        }
        setQDone(items.length); setQCurrent(''); setQRunning(false); router.reload();
    };

    // ── Image extract ──────────────────────────────────────────────────────────
    const onImageChange = e => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImgFile(file);
        setImgPreview(URL.createObjectURL(file));
        setImgResult(null); setImgError(''); setImgSelected([]);
    };

    const doExtractFromImage = async () => {
        if (!imgFile) return;
        setImgLoading(true); setImgResult(null); setImgError(''); setImgSelected([]);
        const fd = new FormData();
        fd.append('image', imgFile);
        fd.append('exam_goal', imgGoal);
        const res = await fetch(route('admin.questions.image'), { method: 'POST', headers: { 'X-CSRF-TOKEN': csrf() }, body: fd });
        const data = await res.json().catch(() => ({}));
        setImgLoading(false);
        if (!res.ok) { setImgError(data?.error ?? 'Extraction failed'); return; }
        setImgResult(data.questions ?? []);
        setImgSelected((data.questions ?? []).map((_, i) => i));
    };

    const totalQueueItems = () => {
        const goalList = aiForm.exam_goal ? [aiForm.exam_goal] : GOALS.map(g => g.value);
        return goalList.reduce((acc, g) => acc + (aiForm.subject ? 1 : getSubjects(g).length), 0);
    };

    const tabStyle = t => ({ padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, background: tab === t ? 'rgba(77,111,255,0.2)' : 'rgba(255,255,255,0.04)', color: tab === t ? '#93b4ff' : 'rgba(255,255,255,0.4)', borderBottom: tab === t ? '2px solid #4d6fff' : '2px solid transparent', transition: 'all 0.15s' });

    return (
        <AdminLayout title="Questions">
            <Head title="Questions — Admin" />
            {modal !== null && <QuestionModal initial={modal === 'new' ? null : modal} onClose={() => setModal(null)} />}

            <AnimatePresence>
                {flash?.success && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', marginBottom: 16, fontSize: 13 }}><CheckCircle size={14} /> {flash.success}</motion.div>}
                {flash?.error && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', marginBottom: 16, fontSize: 13 }}><AlertCircle size={14} /> {flash.error}</motion.div>}
            </AnimatePresence>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(77,111,255,0.08)', border: '1px solid rgba(77,111,255,0.15)' }}>
                    <div style={{ color: '#93b4ff', fontSize: 22, fontWeight: 900 }}>{stats.total}</div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>📋 মোট প্রশ্ন</div>
                </div>
                <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
                    <div style={{ color: '#c084fc', fontSize: 22, fontWeight: 900 }}>{stats.ai}</div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>✨ AI Generated</div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <button style={tabStyle('list')} onClick={() => setTab('list')}>📋 Questions</button>
                <button style={tabStyle('import')} onClick={() => setTab('import')}>📤 JSON Import</button>
                <button style={tabStyle('ai')} onClick={() => setTab('ai')}>✨ AI Generate</button>
                <button style={tabStyle('image')} onClick={() => setTab('image')}>🖼️ ছবি থেকে</button>
            </div>

            {/* ── LIST ─────────────────────────────────────────────────────── */}
            {tab === 'list' && (
                <div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                        <form onSubmit={doSearch} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 200 }}>
                            <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
                                <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="প্রশ্ন খোঁজো..." style={{ ...INP, paddingLeft: 30 }} />
                            </div>
                            <select value={goalFilter} onChange={e => { setGoal(e.target.value); router.get(route('admin.questions'), { q: search, goal: e.target.value }); }} style={{ ...SEL, width: 110 }}>
                                <option value="">সব</option>
                                {GOALS.map(g => <option key={g.value} value={g.value} style={{ background: '#0c1025' }}>{g.label}</option>)}
                            </select>
                            <button type="submit" style={{ padding: '9px 14px', borderRadius: 10, background: 'rgba(77,111,255,0.2)', border: '1px solid rgba(77,111,255,0.3)', color: '#93b4ff', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>খোঁজো</button>
                        </form>
                        <button onClick={() => setModal('new')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, background: 'linear-gradient(135deg,#4d6fff,#7c3aed)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                            <Plus size={14} /> প্রশ্ন যোগ করো
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {questions.data.map((q, i) => (
                            <motion.div key={q.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} style={{ padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6, alignItems: 'center' }}>
                                            <span style={{ padding: '2px 8px', borderRadius: 8, background: 'rgba(77,111,255,0.1)', color: '#93b4ff', fontSize: 10, fontWeight: 700 }}>{q.exam_goal?.toUpperCase()}</span>
                                            <DiffBadge level={q.difficulty_level} />
                                            {q.is_ai_generated && <span style={{ padding: '2px 8px', borderRadius: 8, background: 'rgba(124,58,237,0.12)', color: '#c084fc', fontSize: 10 }}>✨ AI</span>}
                                            {q.subject && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>{q.subject}</span>}
                                            {q.board_year && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>{q.board_year}</span>}
                                        </div>
                                        <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 1.5, marginBottom: 8 }}>{q.question_text.length > 120 ? q.question_text.slice(0, 120) + '...' : q.question_text}</div>
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            {Object.entries(q.options ?? {}).map(([k, v]) => <span key={k} style={{ fontSize: 11, color: q.correct_answer === k ? '#34d399' : 'rgba(255,255,255,0.35)', fontWeight: q.correct_answer === k ? 700 : 400 }}>{k.toUpperCase()}. {v}</span>)}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                        <button onClick={() => setModal(q)} style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(77,111,255,0.1)', border: '1px solid rgba(77,111,255,0.2)', color: '#93b4ff', cursor: 'pointer' }}><Edit3 size={13} /></button>
                                        <button onClick={() => doDelete(q)} style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', cursor: 'pointer' }}><Trash2 size={13} /></button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {questions.data.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>কোনো প্রশ্ন পাওয়া যায়নি।</div>}
                    </div>
                    {questions.last_page > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
                            {questions.prev_page_url && <Link href={questions.prev_page_url} style={{ padding: '7px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}><ChevronLeft size={14} /> আগে</Link>}
                            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, display: 'flex', alignItems: 'center' }}>{questions.current_page}/{questions.last_page}</span>
                            {questions.next_page_url && <Link href={questions.next_page_url} style={{ padding: '7px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>পরে <ChevronRight size={14} /></Link>}
                        </div>
                    )}
                </div>
            )}

            {/* ── JSON IMPORT ───────────────────────────────────────────────── */}
            {tab === 'import' && (
                <div style={{ maxWidth: 700 }}>
                    <div style={{ marginBottom: 14, padding: '14px 16px', borderRadius: 12, background: 'rgba(77,111,255,0.06)', border: '1px solid rgba(77,111,255,0.15)', fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                        📌 JSON array paste করো অথবা <code style={{ color: '#93b4ff' }}>{`{"questions": [...]}`}</code> format এ।
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                        <select value={importGoal} onChange={e => setImportGoal(e.target.value)} style={{ ...SEL, width: 150 }}>
                            {GOALS.map(g => <option key={g.value} value={g.value} style={{ background: '#0c1025' }}>{g.label}</option>)}
                        </select>
                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, display: 'flex', alignItems: 'center' }}>← Exam Goal নির্বাচন করো</span>
                    </div>
                    <textarea value={jsonText} onChange={e => setJsonText(e.target.value)} rows={18} placeholder='[{"question_text": "...", "options": {"a":"..","b":"..","c":"..","d":".."}, "correct_answer": "b", ...}]' style={{ ...INP, fontFamily: 'monospace', fontSize: 12, resize: 'vertical' }} />
                    <button onClick={doImport} disabled={importing || !jsonText.trim()} style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', borderRadius: 11, background: importing ? 'rgba(77,111,255,0.3)' : 'linear-gradient(135deg,#4d6fff,#7c3aed)', color: 'white', border: 'none', cursor: importing ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13 }}>
                        <Upload size={14} /> {importing ? 'Import হচ্ছে...' : 'Import করো'}
                    </button>
                </div>
            )}

            {/* ── AI GENERATE ───────────────────────────────────────────────── */}
            {tab === 'ai' && (
                <div style={{ maxWidth: 700 }}>
                    {/* Queue Progress */}
                    {(qRunning || (queue.length > 0 && qDone >= queue.length)) && (
                        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '16px 18px', borderRadius: 14, background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: 18 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ color: '#34d399', fontWeight: 700, fontSize: 13 }}>{qRunning ? `⚡ চলছে: ${qCurrent}` : '✅ Queue শেষ!'}</span>
                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{qDone}/{queue.length} · {qSaved} সেভ হয়েছে</span>
                            </div>
                            <div style={{ height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                <motion.div animate={{ width: `${queue.length > 0 ? (qDone / queue.length * 100) : 0}%` }} transition={{ duration: 0.4 }} style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg,#34d399,#4d6fff)' }} />
                            </div>
                            {qRunning && <button onClick={() => { qStop.current = true; }} style={{ marginTop: 10, padding: '5px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', cursor: 'pointer', fontSize: 12 }}>⛔ থামাও</button>}
                        </motion.div>
                    )}

                    <div style={{ padding: '18px 20px', borderRadius: 16, background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', marginBottom: 20 }}>
                        <div style={{ color: 'white', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><Sparkles size={16} color="#c084fc" /> Gemini দিয়ে প্রশ্ন তৈরি করো</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <div><label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, display: 'block', marginBottom: 4 }}>পরীক্ষার লক্ষ্য <span style={{ color: 'rgba(255,255,255,0.2)' }}>(Optional)</span></label>
                                <select value={aiForm.exam_goal} onChange={e => setAiForm(f => ({ ...f, exam_goal: e.target.value, subject: '' }))} style={SEL}>
                                    <option value="" style={{ background: '#0c1025' }}>-- সব Exam --</option>
                                    {GOALS.map(g => <option key={g.value} value={g.value} style={{ background: '#0c1025' }}>{g.label}</option>)}
                                </select>
                            </div>
                            <div><label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, display: 'block', marginBottom: 4 }}>Difficulty</label>
                                <select value={aiForm.difficulty} onChange={e => setAiForm(f => ({ ...f, difficulty: e.target.value }))} style={SEL}>
                                    {DIFFICULTIES.map(d => <option key={d} value={d} style={{ background: '#0c1025' }}>{d}</option>)}
                                </select>
                            </div>
                            <div><label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, display: 'block', marginBottom: 4 }}>পরীক্ষার বিষয় <span style={{ color: 'rgba(255,255,255,0.2)' }}>(Optional)</span></label>
                                <select value={aiForm.subject} onChange={e => setAiForm(f => ({ ...f, subject: e.target.value }))} style={SEL}>
                                    <option value="" style={{ background: '#0c1025' }}>-- সব বিষয় --</option>
                                    {getSubjects(aiForm.exam_goal).map(s => <option key={s} value={s} style={{ background: '#0c1025' }}>{s}</option>)}
                                </select>
                            </div>
                            <div><label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, display: 'block', marginBottom: 4 }}>প্রতি বিষয়ে কতটি? (১-৫)</label>
                                <input type="number" min="1" max="5" value={aiForm.count} onChange={e => setAiForm(f => ({ ...f, count: Number(e.target.value) }))} style={INP} />
                            </div>
                            <div style={{ gridColumn: '1/-1' }}><label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, display: 'block', marginBottom: 4 }}>Board Year (optional)</label>
                                <input value={aiForm.board_year} onChange={e => setAiForm(f => ({ ...f, board_year: e.target.value }))} placeholder="৪৫তম বিসিএস প্রিলিমিনারি" style={INP} />
                            </div>
                        </div>

                        {/* Queue info hint */}
                        <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 9, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                            ⚡ Queue এ {totalQueueItems()} টি item — প্রতিটি আলাদা request, auto-save হবে
                        </div>

                        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                            {aiForm.exam_goal && aiForm.subject && (
                                <button onClick={doGenerate} disabled={generating || qRunning} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 11, background: generating ? 'rgba(124,58,237,0.3)' : 'linear-gradient(135deg,#7c3aed,#4d6fff)', color: 'white', border: 'none', cursor: generating ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13 }}>
                                    <Sparkles size={14} /> {generating ? 'Gemini চিন্তা করছে...' : 'Generate (Review সহ)'}
                                </button>
                            )}
                            <button onClick={() => {
                                const goalList = aiForm.exam_goal ? [aiForm.exam_goal] : GOALS.map(g => g.value);
                                const items = [];
                                for (const goal of goalList) {
                                    const subs = aiForm.subject ? [aiForm.subject] : getSubjects(goal);
                                    for (const sub of subs) items.push({ exam_goal: goal, subject: sub });
                                }
                                startQueue(items);
                            }} disabled={qRunning || generating} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 11, background: qRunning ? 'rgba(245,158,11,0.2)' : 'linear-gradient(135deg,#f59e0b,#ef4444)', color: 'white', border: 'none', cursor: qRunning ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13 }}>
                                ⚡ Queue চালু (Auto-save)
                            </button>
                        </div>
                    </div>

                    {aiError && <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13, marginBottom: 16 }}>❌ {aiError}</div>}

                    {aiResult && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <span style={{ color: 'white', fontWeight: 700 }}>✨ {aiResult.length}টি প্রশ্ন তৈরি হয়েছে</span>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={() => setSelected(aiResult.map((_, i) => i))} style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(77,111,255,0.1)', border: '1px solid rgba(77,111,255,0.2)', color: '#93b4ff', cursor: 'pointer', fontSize: 12 }}>সব নির্বাচন</button>
                                    <button onClick={() => doSaveAi(aiResult, selected, aiForm.exam_goal)} disabled={selected.length === 0} style={{ padding: '6px 14px', borderRadius: 8, background: selected.length > 0 ? 'linear-gradient(135deg,#4d6fff,#7c3aed)' : 'rgba(255,255,255,0.05)', color: 'white', border: 'none', cursor: selected.length > 0 ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 700 }}>{selected.length} টি সেভ করো</button>
                                </div>
                            </div>
                            <QuestionPreviewList items={aiResult} selected={selected} toggle={i => setSelected(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i])} difficulty={aiForm.difficulty} />
                        </div>
                    )}
                </div>
            )}

            {/* ── IMAGE EXTRACT ─────────────────────────────────────────────── */}
            {tab === 'image' && (
                <div style={{ maxWidth: 700 }}>
                    <div style={{ padding: '20px 22px', borderRadius: 16, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', marginBottom: 20 }}>
                        <div style={{ color: 'white', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><ImagePlus size={16} color="#fbbf24" /> ছবি আপলোড করো — AI প্রশ্ন বের করবে</div>
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginBottom: 14 }}>প্রশ্নপত্রের ছবি, বইয়ের পাতা, হাতে লেখা MCQ — যেকোনো ছবি দাও। Gemini Vision পড়ে MCQ প্রশ্ন বের করবে।</p>

                        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                            <select value={imgGoal} onChange={e => setImgGoal(e.target.value)} style={{ ...SEL, width: 160 }}>
                                {GOALS.map(g => <option key={g.value} value={g.value} style={{ background: '#0c1025' }}>{g.label}</option>)}
                            </select>
                            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, display: 'flex', alignItems: 'center' }}>← Exam Goal</span>
                        </div>

                        {/* Drop zone */}
                        <div onClick={() => imgRef.current?.click()} style={{ border: '2px dashed rgba(245,158,11,0.3)', borderRadius: 14, padding: imgPreview ? 8 : '32px 20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', background: 'rgba(245,158,11,0.03)' }}
                            onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { setImgFile(f); setImgPreview(URL.createObjectURL(f)); setImgResult(null); setImgError(''); } }}>
                            {imgPreview
                                ? <img src={imgPreview} alt="preview" style={{ maxWidth: '100%', maxHeight: 320, borderRadius: 10, objectFit: 'contain' }} />
                                : <>
                                    <ImagePlus size={32} color="rgba(245,158,11,0.5)" style={{ marginBottom: 10 }} />
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>ছবি drag করো অথবা <span style={{ color: '#fbbf24', textDecoration: 'underline' }}>browse করো</span></div>
                                    <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, marginTop: 4 }}>JPG, PNG, WEBP — max 10MB</div>
                                </>}
                        </div>
                        <input ref={imgRef} type="file" accept="image/*" onChange={onImageChange} style={{ display: 'none' }} />

                        {imgPreview && (
                            <button onClick={doExtractFromImage} disabled={imgLoading} style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', borderRadius: 11, background: imgLoading ? 'rgba(245,158,11,0.3)' : 'linear-gradient(135deg,#f59e0b,#ef4444)', color: 'white', border: 'none', cursor: imgLoading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13 }}>
                                <Sparkles size={14} /> {imgLoading ? 'Gemini পড়ছে...' : 'প্রশ্ন বের করো'}
                            </button>
                        )}
                    </div>

                    {imgError && <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13, marginBottom: 16 }}>❌ {imgError}</div>}

                    {imgResult && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <span style={{ color: 'white', fontWeight: 700 }}>🖼️ {imgResult.length}টি প্রশ্ন পাওয়া গেছে</span>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={() => setImgSelected(imgResult.map((_, i) => i))} style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(77,111,255,0.1)', border: '1px solid rgba(77,111,255,0.2)', color: '#93b4ff', cursor: 'pointer', fontSize: 12 }}>সব নির্বাচন</button>
                                    <button onClick={() => doSaveAi(imgResult, imgSelected, imgGoal)} disabled={imgSelected.length === 0} style={{ padding: '6px 14px', borderRadius: 8, background: imgSelected.length > 0 ? 'linear-gradient(135deg,#4d6fff,#7c3aed)' : 'rgba(255,255,255,0.05)', color: 'white', border: 'none', cursor: imgSelected.length > 0 ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 700 }}>{imgSelected.length} টি সেভ করো</button>
                                </div>
                            </div>
                            <QuestionPreviewList items={imgResult} selected={imgSelected} toggle={i => setImgSelected(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i])} difficulty="MEDIUM" />
                        </div>
                    )}
                </div>
            )}
        </AdminLayout>
    );
}

// ── Shared preview list ───────────────────────────────────────────────────────
function QuestionPreviewList({ items, selected, toggle, difficulty }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((q, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    onClick={() => toggle(i)} style={{ padding: '14px 16px', borderRadius: 14, cursor: 'pointer', border: `1px solid ${selected.includes(i) ? '#4d6fff' : 'rgba(255,255,255,0.06)'}`, background: selected.includes(i) ? 'rgba(77,111,255,0.08)' : 'rgba(255,255,255,0.02)', transition: 'all 0.15s' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${selected.includes(i) ? '#4d6fff' : 'rgba(255,255,255,0.2)'}`, background: selected.includes(i) ? '#4d6fff' : 'transparent', flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {selected.includes(i) && <CheckCircle size={12} color="white" />}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                                <DiffBadge level={q.difficulty_level ?? difficulty} />
                                {q.subject && <span style={{ color: '#93b4ff', fontSize: 10 }}>{q.subject}</span>}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 1.55, marginBottom: 8 }}>{q.question_text}</div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {Object.entries(q.options ?? {}).map(([k, v]) => <span key={k} style={{ fontSize: 11, color: q.correct_answer === k ? '#34d399' : 'rgba(255,255,255,0.35)', fontWeight: q.correct_answer === k ? 700 : 400 }}>{k.toUpperCase()}. {v}</span>)}
                            </div>
                            {q.explanation && <div style={{ marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>💡 {q.explanation.slice(0, 100)}</div>}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
