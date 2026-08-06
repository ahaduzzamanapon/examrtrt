import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
        './resources/js/**/*.js',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Hind Siliguri', 'Inter', ...defaultTheme.fontFamily.sans],
                bengali: ['Hind Siliguri', 'sans-serif'],
            },
            colors: {
                // Primary brand palette
                arena: {
                    50:  '#f0f4ff',
                    100: '#e0eaff',
                    200: '#c4d4ff',
                    300: '#9db5ff',
                    400: '#7090ff',
                    500: '#4d6fff',  // Primary
                    600: '#2e4fff',
                    700: '#1a38e8',
                    800: '#1630c4',
                    900: '#132b9b',
                    950: '#0c1c6b',
                },
                // Accent — vibrant orange/gold for wins and alerts
                gold: {
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706',
                },
                // Success green
                emerald: {
                    400: '#34d399',
                    500: '#10b981',
                },
                // Glass surfaces
                glass: {
                    dark:  'rgba(10, 14, 35, 0.85)',
                    mid:   'rgba(20, 27, 60, 0.70)',
                    light: 'rgba(255, 255, 255, 0.08)',
                    border:'rgba(255, 255, 255, 0.10)',
                },
            },
            backgroundImage: {
                'arena-gradient':    'linear-gradient(135deg, #0a0e23 0%, #0f1a3e 50%, #0a1628 100%)',
                'arena-gradient-lg': 'linear-gradient(135deg, #0a0e23 0%, #111b45 30%, #0d2040 70%, #0a0e23 100%)',
                'card-gradient':     'linear-gradient(135deg, rgba(77,111,255,0.15) 0%, rgba(139,92,246,0.10) 100%)',
                'btn-gradient':      'linear-gradient(135deg, #4d6fff 0%, #7c3aed 100%)',
                'gold-gradient':     'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                'danger-gradient':   'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                'success-gradient':  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            },
            backdropBlur: {
                xs: '4px',
                glass: '20px',
            },
            boxShadow: {
                glass:       '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.10)',
                'glass-sm':  '0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
                'glass-lg':  '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)',
                'arena':     '0 0 30px rgba(77,111,255,0.3)',
                'gold':      '0 0 20px rgba(245,158,11,0.4)',
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.5rem',
                '4xl': '2rem',
            },
            // Mobile-first safe areas
            spacing: {
                'safe-bottom': 'env(safe-area-inset-bottom)',
                'safe-top':    'env(safe-area-inset-top)',
                '18': '4.5rem',
                '22': '5.5rem',
                'nav': '4.5rem',   // Bottom nav height
            },
            // Touch target minimum
            minHeight: {
                'touch': '44px',   // Apple HIG minimum touch target
                'touch-lg': '56px',
            },
            minWidth: {
                'touch': '44px',
            },
            animation: {
                'pulse-slow':      'pulse 3s ease-in-out infinite',
                'float':           'float 6s ease-in-out infinite',
                'glow':            'glow 2s ease-in-out infinite',
                'slide-up':        'slideUp 0.3s ease-out',
                'slide-down':      'slideDown 0.3s ease-out',
                'fade-in':         'fadeIn 0.25s ease-out',
                'bounce-in':       'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
                'score-pop':       'scorePop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                'shimmer':         'shimmer 2s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%':      { transform: 'translateY(-10px)' },
                },
                glow: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(77,111,255,0.3)' },
                    '50%':      { boxShadow: '0 0 40px rgba(77,111,255,0.6)' },
                },
                slideUp: {
                    from: { transform: 'translateY(20px)', opacity: '0' },
                    to:   { transform: 'translateY(0)',    opacity: '1' },
                },
                slideDown: {
                    from: { transform: 'translateY(-20px)', opacity: '0' },
                    to:   { transform: 'translateY(0)',      opacity: '1' },
                },
                fadeIn: {
                    from: { opacity: '0' },
                    to:   { opacity: '1' },
                },
                bounceIn: {
                    '0%':   { transform: 'scale(0.8)', opacity: '0' },
                    '100%': { transform: 'scale(1)',   opacity: '1' },
                },
                scorePop: {
                    '0%':   { transform: 'scale(1)' },
                    '50%':  { transform: 'scale(1.3)' },
                    '100%': { transform: 'scale(1)' },
                },
                shimmer: {
                    '0%':   { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition:  '200% 0' },
                },
            },
            screens: {
                // Mobile-first breakpoints (xs added for very small phones)
                'xs': '375px',
                'sm': '640px',
                'md': '768px',
                'lg': '1024px',
                'xl': '1280px',
            },
        },
    },

    plugins: [
        forms,
        // Custom plugin for glass utilities
        function({ addUtilities, addComponents }) {
            addUtilities({
                '.glass-card': {
                    background:     'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    '-webkit-backdrop-filter': 'blur(20px)',
                    border:         '1px solid rgba(255,255,255,0.10)',
                    boxShadow:      '0 8px 32px rgba(0,0,0,0.4)',
                },
                '.glass-card-hover': {
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        background:  'rgba(255,255,255,0.08)',
                        borderColor: 'rgba(255,255,255,0.18)',
                        transform:   'translateY(-2px)',
                    },
                    '&:active': {
                        transform: 'scale(0.98)',  // Mobile tap feedback
                    },
                },
                '.glass-nav': {
                    background:     'rgba(10,14,35,0.90)',
                    backdropFilter: 'blur(20px)',
                    '-webkit-backdrop-filter': 'blur(20px)',
                    borderTop:      '1px solid rgba(255,255,255,0.10)',
                },
                '.touch-target': {
                    minHeight: '44px',
                    minWidth:  '44px',
                    display:   'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                },
                '.no-scrollbar': {
                    '-ms-overflow-style': 'none',
                    'scrollbar-width':    'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                },
                '.text-gradient': {
                    background: 'linear-gradient(135deg, #4d6fff, #a78bfa)',
                    '-webkit-background-clip': 'text',
                    '-webkit-text-fill-color': 'transparent',
                    backgroundClip: 'text',
                },
                '.text-gradient-gold': {
                    background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                    '-webkit-background-clip': 'text',
                    '-webkit-text-fill-color': 'transparent',
                    backgroundClip: 'text',
                },
            });
        },
    ],
};
