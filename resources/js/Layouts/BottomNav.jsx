import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Home, Zap, BookOpen, Trophy, User } from 'lucide-react';

const tabs = [
    { href: 'dashboard',      icon: Home,     label: 'হোম' },
    { href: 'exams.index',    icon: Zap,      label: 'কনটেস্ট' },
    { href: 'practice.index', icon: BookOpen, label: 'প্র্যাকটিস' },
    { href: 'leaderboard.index', icon: Trophy, label: 'র‍্যাংক' },
    { href: 'profile.show',   icon: User,     label: 'প্রোফাইল' },
];

export default function BottomNav() {
    const { url } = usePage();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2 safe-area-pb"
            style={{
                background: 'rgba(5,7,26,0.95)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(255,255,255,0.08)',
            }}>
            {tabs.map(tab => {
                const isActive = url.startsWith('/' + tab.href.replace('.', '/').replace('index', ''));
                return (
                    <Link key={tab.href}
                        href={route(tab.href)}
                        className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all min-w-[48px]"
                        style={{ color: isActive ? '#4d6fff' : 'rgba(255,255,255,0.4)' }}>
                        <tab.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                        <span className="text-[10px] font-medium">{tab.label}</span>
                        {isActive && (
                            <span className="w-1 h-1 rounded-full mt-0.5"
                                style={{ background: '#4d6fff' }} />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
