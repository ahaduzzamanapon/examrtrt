import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Home, Zap, BookOpen, Wallet, User,
} from 'lucide-react';

const navItems = [
    { href: 'dashboard',       icon: Home,     label: 'হোম',     id: 'home' },
    { href: 'exams.index',     icon: Zap,      label: 'লাইভ',    id: 'live' },
    { href: 'practice.index',  icon: BookOpen, label: 'প্র্যাকটিস', id: 'practice' },
    { href: 'wallet.index',    icon: Wallet,   label: 'ওয়ালেট',  id: 'wallet' },
    { href: 'profile.show',    icon: User,     label: 'প্রোফাইল', id: 'profile' },
];

export default function BottomNav() {
    const { url } = usePage();

    return (
        <nav className="bottom-nav" style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
            {navItems.map((item) => {
                const Icon    = item.icon;
                const isActive = url.startsWith('/' + item.id) ||
                    (item.id === 'home' && url === '/dashboard');

                return (
                    <Link
                        key={item.id}
                        href={route(item.href)}
                        className="bottom-nav-item"
                        style={{ color: isActive ? '#4d6fff' : undefined }}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="nav-indicator"
                                className="absolute top-0 w-10 h-0.5 rounded-full"
                                style={{ background: 'linear-gradient(90deg, #4d6fff, #7c3aed)' }}
                                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                            />
                        )}
                        <motion.div
                            whileTap={{ scale: 0.85 }}
                            transition={{ type: 'spring', stiffness: 600, damping: 20 }}
                            className="relative flex flex-col items-center gap-0.5"
                        >
                            <Icon
                                size={22}
                                strokeWidth={isActive ? 2.5 : 1.8}
                                className={isActive ? 'text-arena-500' : 'text-white/40'}
                            />
                            <span
                                className="text-[10px] font-medium"
                                style={{ color: isActive ? '#4d6fff' : 'rgba(255,255,255,0.4)' }}
                            >
                                {item.label}
                            </span>
                        </motion.div>
                    </Link>
                );
            })}
        </nav>
    );
}
