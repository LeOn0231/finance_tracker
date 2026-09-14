import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#090b10',
        surface: {
          50: '#1a1f2c',
          100: '#141824',
          200: '#10131d',
          300: '#0c0f17',
          DEFAULT: '#101420',
          card: '#121726',
          elevated: '#181e32',
          border: 'rgba(255, 255, 255, 0.08)',
          hover: 'rgba(255, 255, 255, 0.05)',
        },
        quest: {
          gold: {
            DEFAULT: '#f59e0b',
            glow: '#fbbf24',
            dark: '#b45309',
          },
          crimson: {
            DEFAULT: '#ef4444',
            glow: '#f87171',
            dark: '#991b1b',
          },
          violet: {
            DEFAULT: '#8b5cf6',
            glow: '#a78bfa',
            dark: '#5b21b6',
          },
          emerald: {
            DEFAULT: '#10b981',
            glow: '#34d399',
            dark: '#065f46',
          },
          cyan: {
            DEFAULT: '#06b6d4',
            glow: '#22d3ee',
            dark: '#0e7490',
          },
        },
        tier: {
          s: {
            text: '#fbbf24',
            bg: 'rgba(245, 158, 11, 0.15)',
            border: '#f59e0b',
            glow: 'rgba(245, 158, 11, 0.4)',
          },
          a: {
            text: '#c084fc',
            bg: 'rgba(168, 85, 247, 0.15)',
            border: '#a855f7',
            glow: 'rgba(168, 85, 247, 0.35)',
          },
          b: {
            text: '#34d399',
            bg: 'rgba(16, 185, 129, 0.15)',
            border: '#10b981',
            glow: 'rgba(16, 185, 129, 0.35)',
          },
          c: {
            text: '#38bdf8',
            bg: 'rgba(14, 165, 233, 0.15)',
            border: '#0ea5e9',
            glow: 'rgba(14, 165, 233, 0.35)',
          },
          d: {
            text: '#94a3b8',
            bg: 'rgba(148, 163, 184, 0.15)',
            border: '#64748b',
            glow: 'rgba(100, 116, 139, 0.3)',
          },
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 25px -5px rgba(245, 158, 11, 0.35)',
        'glow-crimson': '0 0 25px -5px rgba(239, 68, 68, 0.35)',
        'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.35)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
        'card-hover': '0 12px 30px -10px rgba(0, 0, 0, 0.6), 0 0 15px -2px rgba(245, 158, 11, 0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-bounce': 'glowBounce 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        glowBounce: {
          '0%': { boxShadow: '0 0 15px rgba(245, 158, 11, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(245, 158, 11, 0.5)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
