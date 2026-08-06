import { Link, usePage } from '@inertiajs/react';
import { Home, Zap, BookOpen, Film, User } from 'lucide-react';

const tabs = [
    { href: 'dashboard',      icon: Home,     label: 'হোম' },
    { href: 'exams.index',    icon: Zap,      label: 'কনটেস্ট', hasAlert: true },
    { href: 'reel.index',     icon: Film,     label: 'রিল' },
    { href: 'practice.index', icon: BookOpen, label: 'প্র্যাকটিস' },
    { href: 'profile.show',   icon: User,     label: 'প্রোফাইল' },
];

export default function BottomNav() {
    const { url, props } = usePage();
    const hasActiveContest = !!props.hasActiveContest;

    const getRoutePath = (href) => {
        if (href === 'dashboard') return '/dashboard';
        const routeName = href.split('.')[0];
        return '/' + routeName;
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2 safe-area-pb"
            style={{
                background: 'rgba(5,7,26,0.96)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(255,255,255,0.08)',
            }}>
            {tabs.map(tab => {
                const basePath = getRoutePath(tab.href);
                const isActive = url === basePath || url.startsWith(basePath + '/');
                const showAlert = tab.hasAlert && hasActiveContest;

                return (
                    <Link key={tab.href}
                        href={route(tab.href)}
                        className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all min-w-[50px] relative"
                        style={{ color: isActive ? '#4d6fff' : 'rgba(255,255,255,0.45)' }}>

                        <div className="relative">
                            <tab.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                            {showAlert && (
                                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                </span>
                            )}
                        </div>

                        <span className="text-[10px] font-semibold">{tab.label}</span>

                        {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full mt-0.5"
                                style={{ background: '#4d6fff', boxShadow: '0 0 6px #4d6fff' }} />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
