import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function ChatbotWidget() {
    const [open, setOpen]       = useState(false);
    const [input, setInput]     = useState('');
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            text: 'হ্যালো! আমি Arena Bot। পরীক্ষা, ওয়ালেট বা যেকোনো বিষয়ে সাহায্য করতে পারি। কী জানতে চান?',
        },
    ]);
    const [loading, setLoading] = useState(false);
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, open]);

    const send = async () => {
        const text = input.trim();
        if (!text || loading) return;

        setMessages(m => [...m, { role: 'user', text }]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch(route('bot.chat'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ message: text }),
            });
            const data = await res.json();
            setMessages(m => [...m, { role: 'bot', text: data.response }]);
        } catch {
            setMessages(m => [...m, { role: 'bot', text: 'দুঃখিত, এই মুহূর্তে সাড়া দিতে পারছি না। একটু পরে আবার চেষ্টা করুন।' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chatbot-widget">
            <AnimatePresence>
                {open && (
                    <motion.div
                        key="window"
                        initial={{ opacity: 0, scale: 0.85, y: 20 }}
                        animate={{ opacity: 1, scale: 1,    y: 0  }}
                        exit={{   opacity: 0, scale: 0.85, y: 20  }}
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                        className="chatbot-window mb-3"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10"
                            style={{ background: 'linear-gradient(135deg, rgba(77,111,255,0.25), rgba(124,58,237,0.2))' }}>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg, #4d6fff, #7c3aed)' }}>
                                    <Bot size={16} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-white text-sm font-semibold">Arena Bot</p>
                                    <p className="text-emerald-400 text-xs flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                                        অনলাইন
                                    </p>
                                </div>
                            </div>
                            <motion.button whileTap={{ scale: 0.88 }} onClick={() => setOpen(false)}
                                className="touch-target rounded-lg">
                                <X size={18} className="text-white/60" />
                            </motion.button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className="max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed"
                                        style={msg.role === 'user' ? {
                                            background: 'linear-gradient(135deg, #4d6fff, #7c3aed)',
                                            color: 'white',
                                            borderBottomRightRadius: '4px',
                                        } : {
                                            background: 'rgba(255,255,255,0.07)',
                                            color: 'rgba(255,255,255,0.85)',
                                            border: '1px solid rgba(255,255,255,0.10)',
                                            borderBottomLeftRadius: '4px',
                                        }}
                                    >
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}>
                                        <Loader2 size={16} className="text-white/50 animate-spin" />
                                    </div>
                                </div>
                            )}
                            <div ref={endRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-white/10 flex gap-2">
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && send()}
                                placeholder="প্রশ্ন লিখুন..."
                                className="flex-1 input-glass text-sm"
                                style={{ minHeight: '40px', padding: '8px 12px' }}
                                disabled={loading}
                            />
                            <motion.button
                                whileTap={{ scale: 0.88 }}
                                onClick={send}
                                disabled={loading || !input.trim()}
                                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{
                                    background: input.trim() ? 'linear-gradient(135deg, #4d6fff, #7c3aed)' : 'rgba(255,255,255,0.08)',
                                    opacity: loading ? 0.5 : 1,
                                }}
                            >
                                <Send size={16} className="text-white" />
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bubble toggle button */}
            <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => setOpen(o => !o)}
                className="chatbot-bubble"
                aria-label="চ্যাটবট খুলুন"
            >
                <AnimatePresence mode="wait">
                    {open ? (
                        <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                            <X size={24} className="text-white" />
                        </motion.div>
                    ) : (
                        <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                            <MessageCircle size={24} className="text-white" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
}
