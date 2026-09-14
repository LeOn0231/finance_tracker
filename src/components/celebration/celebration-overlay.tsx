'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '@/lib/sound';
import { DreamPurchaseItem } from '@/lib/types';
import { SafeImage } from '@/components/ui/safe-image';
import { Trophy, Sparkles, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CelebrationOverlayProps {
  dream: DreamPurchaseItem | null;
  onClose: () => void;
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({ dream, onClose }) => {
  useEffect(() => {
    if (dream) {
      // 1. Play synthesized victory fanfare
      sounds.playQuestComplete();

      // 2. Fire high-impact golden anime particle explosion
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ['#f59e0b', '#fbbf24', '#ef4444', '#a855f7', '#34d399', '#ffffff'],
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ['#f59e0b', '#fbbf24', '#ef4444', '#a855f7', '#34d399', '#ffffff'],
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [dream]);

  if (!dream) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Dark overlay backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/90 backdrop-blur-xl animate-fadeIn"
      />

      {/* Celebration Panel */}
      <div className="relative w-full max-w-lg z-10 rounded-3xl bg-gradient-to-b from-[#181e35] via-[#101424] to-[#0a0d16] border-2 border-amber-400/70 p-6 sm:p-8 text-center shadow-[0_0_80px_rgba(245,158,11,0.4)] animate-scaleUp">
        {/* Glow rings */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Banner */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-500/20 border border-amber-400/50 text-amber-300 text-xs sm:text-sm font-black tracking-widest uppercase mb-4 shadow-glow-gold animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          QUEST COMPLETE • DREAM ACQUIRED
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide mb-2 drop-shadow-md">
          {dream.name}
        </h2>

        {dream.brand && (
          <p className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider mb-5">
            {dream.brand}
          </p>
        )}

        {/* Dream Image with gold frame */}
        <div className="relative mx-auto w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border-2 border-amber-400/60 shadow-[0_0_30px_rgba(245,158,11,0.3)] mb-6">
          <SafeImage
            src={dream.image}
            alt={dream.name}
            category={dream.category}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-2 right-2 p-1.5 rounded-xl bg-teal-500/90 text-black font-bold text-xs flex items-center gap-1 shadow-lg">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            ACQUIRED
          </div>
        </div>

        {/* Purchase Summary */}
        <div className="bg-[#0b0e18]/80 border border-white/10 rounded-2xl p-4 mb-6 text-left space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Final Acquisition Value:</span>
            <span className="text-base font-extrabold text-amber-300 font-mono">
              ${(dream.finalPrice || dream.listedPrice || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Category:</span>
            <span className="text-slate-200 font-medium">{dream.category}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Status:</span>
            <span className="text-teal-400 font-bold">Recorded in Hall of Fame</span>
          </div>
        </div>

        <Button onClick={onClose} variant="gold" size="lg" className="w-full">
          <Trophy className="w-5 h-5 mr-2" />
          Celebrate Victory & Continue Quest
        </Button>
      </div>
    </div>
  );
};
