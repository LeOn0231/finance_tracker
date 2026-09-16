'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type AnimeTheme =
  | 'black-clover'
  | 'solo-leveling'
  | 'demon-slayer'
  | 'jjk'
  | 'hunter-x-hunter'
  | 'attack-on-titan'
  | 'haikyuu'
  | 'your-name';

export type AnimationIntensity = 'FULL' | 'REDUCED' | 'OFF';

export type AppCurrency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY';

export interface ThemeConfig {
  id: AnimeTheme;
  name: string;
  series: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  glowColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  icon: string;
  quote: string;
}

export const THEME_CONFIGS: Record<AnimeTheme, ThemeConfig> = {
  'black-clover': {
    id: 'black-clover',
    name: 'Black Clover (Grimoire Gold)',
    series: 'Black Clover',
    description: 'Black Bulls determination, Grimoire gold runes, obsidian and emerald magic.',
    primaryColor: '#f59e0b',
    accentColor: '#10b981',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-500/40',
    icon: '🍀',
    quote: '« Push past your limits. Right here, right now. »',
  },
  'solo-leveling': {
    id: 'solo-leveling',
    name: 'Solo Leveling (Shadow Monarch)',
    series: 'Solo Leveling',
    description: 'Dark dungeon aura, System cyan and monarch violet energy pulses.',
    primaryColor: '#3b82f6',
    accentColor: '#8b5cf6',
    glowColor: 'rgba(59, 130, 246, 0.45)',
    badgeBg: 'bg-blue-500/15',
    badgeText: 'text-blue-300',
    badgeBorder: 'border-blue-500/40',
    icon: '🗡️',
    quote: '« Arise. The system will grant you your desires. »',
  },
  'demon-slayer': {
    id: 'demon-slayer',
    name: 'Demon Slayer (Sun & Water)',
    series: 'Demon Slayer',
    description: 'Nichirin flame crimson, Hinokami Kagura embers, and water breathing cyan.',
    primaryColor: '#f43f5e',
    accentColor: '#06b6d4',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    badgeBg: 'bg-rose-500/15',
    badgeText: 'text-rose-300',
    badgeBorder: 'border-rose-500/40',
    icon: '⚔️',
    quote: '« Set your heart ablaze! Never give up on your dreams. »',
  },
  'jjk': {
    id: 'jjk',
    name: 'Jujutsu Kaisen (Cursed Energy)',
    series: 'Jujutsu Kaisen',
    description: 'Limitless violet, neon cursed energy indigo, and Sukuna crimson seals.',
    primaryColor: '#6366f1',
    accentColor: '#ec4899',
    glowColor: 'rgba(99, 102, 241, 0.45)',
    badgeBg: 'bg-indigo-500/15',
    badgeText: 'text-indigo-300',
    badgeBorder: 'border-indigo-500/40',
    icon: '🔮',
    quote: '« Throughout heaven and earth, I alone am the honored one. »',
  },
  'hunter-x-hunter': {
    id: 'hunter-x-hunter',
    name: 'Hunter x Hunter (Nen Master)',
    series: 'Hunter x Hunter',
    description: 'Hunter License amber, Nen aura green, and guild adventure parchment.',
    primaryColor: '#84cc16',
    accentColor: '#eab308',
    glowColor: 'rgba(132, 204, 22, 0.4)',
    badgeBg: 'bg-lime-500/15',
    badgeText: 'text-lime-300',
    badgeBorder: 'border-lime-500/40',
    icon: '🧭',
    quote: '« You should enjoy the little detours to the fullest. »',
  },
  'attack-on-titan': {
    id: 'attack-on-titan',
    name: 'Attack on Titan (Scout Regiment)',
    series: 'Attack on Titan',
    description: 'Wings of Freedom forest green, survey corps bronze, and smoky mist.',
    primaryColor: '#16a34a',
    accentColor: '#d97706',
    glowColor: 'rgba(22, 163, 74, 0.4)',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-300',
    badgeBorder: 'border-emerald-500/40',
    icon: '🛡️',
    quote: '« Dedicate your heart! If you don’t fight, you can’t win. »',
  },
  'haikyuu': {
    id: 'haikyuu',
    name: 'Haikyuu (Karasuno Fly)',
    series: 'Haikyuu',
    description: 'High-voltage Karasuno orange, pitch black, and electric golden sparks.',
    primaryColor: '#f97316',
    accentColor: '#facc15',
    glowColor: 'rgba(249, 115, 22, 0.45)',
    badgeBg: 'bg-orange-500/15',
    badgeText: 'text-orange-300',
    badgeBorder: 'border-orange-500/40',
    icon: '🏐',
    quote: '« The future belongs to those who believe in the beauty of their dreams. »',
  },
  'your-name': {
    id: 'your-name',
    name: 'Your Name (Twilight Comet)',
    series: 'Your Name (Kimi no Na wa)',
    description: 'Twilight sky gradients, magical magenta comet trail, and celestial indigo.',
    primaryColor: '#d946ef',
    accentColor: '#38bdf8',
    glowColor: 'rgba(217, 70, 239, 0.4)',
    badgeBg: 'bg-fuchsia-500/15',
    badgeText: 'text-fuchsia-300',
    badgeBorder: 'border-fuchsia-500/40',
    icon: '🌠',
    quote: '« Treasure the experience. Dreams fade on waking up. »',
  },
};

interface ThemeContextType {
  theme: AnimeTheme;
  themeConfig: ThemeConfig;
  setTheme: (theme: AnimeTheme) => void;
  animationIntensity: AnimationIntensity;
  setAnimationIntensity: (intensity: AnimationIntensity) => void;
  currency: AppCurrency;
  setCurrency: (currency: AppCurrency) => void;
  isReducedMotion: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AnimeTheme>('black-clover');
  const [animationIntensity, setAnimationIntensityState] = useState<AnimationIntensity>('FULL');
  const [currency, setCurrencyState] = useState<AppCurrency>('INR');
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Initialize from localStorage and prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Theme
    const savedTheme = localStorage.getItem('lifequest_theme') as AnimeTheme | null;
    if (savedTheme && THEME_CONFIGS[savedTheme]) {
      setThemeState(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'black-clover');
    }

    // 2. Animation Intensity
    const savedAnim = localStorage.getItem('lifequest_anim_intensity') as AnimationIntensity | null;
    if (savedAnim && ['FULL', 'REDUCED', 'OFF'].includes(savedAnim)) {
      setAnimationIntensityState(savedAnim);
      document.documentElement.setAttribute('data-animation', savedAnim.toLowerCase());
    } else {
      document.documentElement.setAttribute('data-animation', 'full');
    }

    // 3. Currency
    const savedCurr = localStorage.getItem('lifequest_currency') as AppCurrency | null;
    if (savedCurr && ['INR', 'USD', 'EUR', 'GBP', 'JPY'].includes(savedCurr)) {
      setCurrencyState(savedCurr);
    }

    // 4. Reduced motion detection
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
      if (e.matches && animationIntensity === 'FULL') {
        setAnimationIntensityState('REDUCED');
        document.documentElement.setAttribute('data-animation', 'reduced');
      }
    };

    mediaQuery.addEventListener('change', handleMotionChange);
    return () => mediaQuery.removeEventListener('change', handleMotionChange);
  }, [animationIntensity]);

  const setTheme = (newTheme: AnimeTheme) => {
    if (!THEME_CONFIGS[newTheme]) return;
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lifequest_theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  const setAnimationIntensity = (newIntensity: AnimationIntensity) => {
    setAnimationIntensityState(newIntensity);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lifequest_anim_intensity', newIntensity);
      document.documentElement.setAttribute('data-animation', newIntensity.toLowerCase());
    }
  };

  const setCurrency = (newCurrency: AppCurrency) => {
    setCurrencyState(newCurrency);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lifequest_currency', newCurrency);
    }
  };

  const currentConfig = THEME_CONFIGS[theme] || THEME_CONFIGS['black-clover'];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeConfig: currentConfig,
        setTheme,
        animationIntensity,
        setAnimationIntensity,
        currency,
        setCurrency,
        isReducedMotion,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
