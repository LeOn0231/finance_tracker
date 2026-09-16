'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '@/lib/sound';
import { DreamPurchaseItem } from '@/lib/types';
import { SafeImage } from '@/components/ui/safe-image';
import { Trophy, Sparkles, Check, X, Award, Flame, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/finance-calculator';
import { EvaluatedAchievement } from '@/lib/achievements';
import { useTheme } from '@/lib/theme-context';

interface CelebrationOverlayProps {
  dream: DreamPurchaseItem | null;
  unlockedAchievement?: EvaluatedAchievement | null;
  onClose: () => void;
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  dream,
  unlockedAchievement,
  onClose,
}) => {
  const { currency, animationIntensity } = useTheme();
  const [countdown, setCountdown] = useState<number>(10);

  useEffect(() => {
    if (dream) {
      // 1. Play victory fanfare
      sounds.playQuestComplete();

      // 2. Particle fireworks if animations not OFF
      if (animationIntensity !== 'OFF') {
        const duration = animationIntensity === 'REDUCED' ? 1.0 * 1000 : 2.5 * 1000;
        const animationEnd = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: animationIntensity === 'REDUCED' ? 2 : 4,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
            colors: ['#f59e0b', '#fbbf24', '#3b82f6', '#8b5cf6', '#10b981', '#ffffff'],
          });
          confetti({
            particleCount: animationIntensity === 'REDUCED' ? 2 : 4,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
            colors: ['#f59e0b', '#fbbf24', '#3b82f6', '#8b5cf6', '#10b981', '#ffffff'],
          });

          if (Date.now() < animationEnd) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      }
    }
  }, [dream, animationIntensity]);

  if (!dream) return null;

  const finalPrice = dream.finalPrice || dream.listedPrice || 0;
  const purchaseDate = dream.datePurchased
    ? new Date(dream.datePurchased).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Dark overlay backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/90 backdrop-blur-xl animate-fadeIn"
      />

      {/* Celebration Panel */}
      <div className="relative w-full max-w-lg z-10 rounded-3xl bg-gradient-to-b from-[#181e35] via-[#101424] to-[#0a0d16] border-2 border-amber-400/80 p-6 sm:p-8 text-center shadow-[0_0_80px_rgba(245,158,11,0.45)] animate-scaleUp">
        {/* Glow rings */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/25 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close celebration"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Banner */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/25 via-yellow-400/35 to-amber-500/25 border border-amber-400/60 text-amber-300 text-xs sm:text-sm font-black tracking-widest uppercase mb-4 shadow-glow-gold animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          QUEST COMPLETE • DREAM ACQUIRED
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide mb-1 drop-shadow-md">
          {dream.name}
        </h2>

        {dream.brand && (
          <p className="text-xs font-semibold text-amber-400/90 uppercase tracking-widest mb-4">
            {dream.brand} {dream.variant ? `• ${dream.variant}` : ''}
          </p>
        )}

        {/* Dream Image with gold frame */}
        <div className="relative mx-auto w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden border-2 border-amber-400/70 shadow-[0_0_35px_rgba(245,158,11,0.35)] mb-5 bg-black">
          <SafeImage
            src={dream.image}
            alt={dream.name}
            category={dream.category}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-2 right-2 p-1.5 rounded-xl bg-teal-500 text-black font-extrabold text-xs flex items-center gap-1 shadow-lg">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            ACQUIRED
          </div>
        </div>

        {/* Purchase Details Summary */}
        <div className="bg-[#0b0e18]/90 border border-white/10 rounded-2xl p-4 mb-4 text-left space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Acquisition Value:</span>
            <span className="text-base font-extrabold text-amber-300 font-mono">
              {formatCurrency(finalPrice, currency)}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Acquisition Date:</span>
            <span className="text-slate-200 font-mono flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {purchaseDate}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Hall of Fame:</span>
            <span className="text-teal-400 font-bold">Chronologically Recorded</span>
          </div>
        </div>

        {/* Newly Unlocked Achievement Badge if applicable */}
        {unlockedAchievement && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-amber-500/20 border border-amber-500/40 text-left flex items-center gap-3 mb-5 shadow-glow-gold animate-pulse">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block">
                ✨ Achievement Unlocked!
              </span>
              <h4 className="text-xs font-bold text-white truncate">{unlockedAchievement.title}</h4>
              <p className="text-[10px] text-slate-400 truncate">{unlockedAchievement.description}</p>
            </div>
          </div>
        )}

        <Button onClick={onClose} variant="gold" size="lg" className="w-full shadow-glow-gold">
          <Trophy className="w-5 h-5 mr-2" />
          Celebrate Victory & Continue Quest
        </Button>
      </div>
    </div>
  );
};
