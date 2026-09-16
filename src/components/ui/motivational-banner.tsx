'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Quote } from 'lucide-react';
import { sounds } from '@/lib/sound';
import { useTheme } from '@/lib/theme-context';

export interface MotivationalQuote {
  quote: string;
  author: string;
  series: string;
}

export const MOTIVATIONAL_QUOTES: MotivationalQuote[] = [
  {
    quote: 'Even without magic, I will become the Wizard King. Push past your limits!',
    author: 'Asta',
    series: 'Black Clover',
  },
  {
    quote: 'I alone level up. The system turns discipline into reality.',
    author: 'Sung Jin-woo',
    series: 'Solo Leveling',
  },
  {
    quote: 'Set your heart ablaze! Never let anyone extinguish your passion for your dreams.',
    author: 'Kyojuro Rengoku',
    series: 'Demon Slayer',
  },
  {
    quote: 'If you win, you live. If you lose, you die. If you don’t fight, you can’t win!',
    author: 'Eren Yeager',
    series: 'Attack on Titan',
  },
  {
    quote: 'The future belongs to those who believe in the beauty of their dreams.',
    author: 'Shoyo Hinata',
    series: 'Haikyuu',
  },
  {
    quote: 'You should enjoy the little detours to the fullest. Because that’s where you’ll find the things more important than what you want.',
    author: 'Ging Freecss',
    series: 'Hunter x Hunter',
  },
  {
    quote: 'One quest at a time. Dreams become plans when you track them.',
    author: 'Grimoire Wisdom',
    series: 'Life Quest',
  },
  {
    quote: 'Today’s disciplined allocation is tomorrow’s flagship possession.',
    author: 'Sanctuary Creed',
    series: 'Life Quest',
  },
];

export const MotivationalBanner: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { themeConfig } = useTheme();
  const [index, setIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Initial random quote
    setIndex(Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));
  }, []);

  const handleNextQuote = () => {
    sounds.playClick();
    setIsFading(true);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
      setIsFading(false);
    }, 150);
  };

  const current = MOTIVATIONAL_QUOTES[index] || MOTIVATIONAL_QUOTES[0];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#101424]/90 via-[#0e111d]/90 to-[#141829]/90 border border-white/[0.08] p-3.5 sm:p-4 shadow-lg transition-all duration-300 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex-shrink-0">
            <Quote className="w-4 h-4" />
          </div>

          <div
            className={`min-w-0 transition-opacity duration-200 ${
              isFading ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <p className="text-xs sm:text-sm font-medium text-slate-200 italic line-clamp-2 leading-relaxed">
              &ldquo;{current.quote}&rdquo;
            </p>
            <div className="flex items-center gap-2 pt-0.5 text-[11px] text-slate-400">
              <span className="font-bold text-amber-400/90">{current.author}</span>
              <span>•</span>
              <span className="text-slate-500">{current.series}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleNextQuote}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-amber-300 border border-white/10 transition-colors flex-shrink-0"
          title="Cycle Motivation"
          aria-label="Next motivational quote"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
