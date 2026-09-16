'use client';

import React, { useState } from 'react';
import { DreamPurchaseItem } from '@/lib/types';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { SafeImage } from '@/components/ui/safe-image';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { formatCurrency } from '@/lib/finance-calculator';
import { sounds } from '@/lib/sound';
import {
  Flame,
  Crown,
  Trophy,
  ArrowRight,
  Pin,
  CheckCircle2,
  Calendar,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface CurrentQuestHeroProps {
  currentQuest: DreamPurchaseItem | null;
  allDreams: DreamPurchaseItem[];
  currency?: string;
  onSelectQuest: (dream: DreamPurchaseItem) => void;
  onSwitchPin: (dreamId: string) => Promise<void>;
  onPurchaseClick: (dream: DreamPurchaseItem) => void;
  onOpenAddDream: () => void;
}

export const CurrentQuestHero: React.FC<CurrentQuestHeroProps> = ({
  currentQuest,
  allDreams,
  currency = 'INR',
  onSelectQuest,
  onSwitchPin,
  onPurchaseClick,
  onOpenAddDream,
}) => {
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const activeDreams = allDreams.filter((d) => d.status !== 'PURCHASED');

  const handleSwitch = async (dreamId: string) => {
    try {
      setIsSwitching(true);
      sounds.playTierUp();
      await onSwitchPin(dreamId);
      setIsSwitchModalOpen(false);
    } catch (error) {
      console.error('Failed to switch quest:', error);
    } finally {
      setIsSwitching(false);
    }
  };

  if (!currentQuest) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#141829] via-[#101422] to-[#181d33] border-2 border-dashed border-amber-500/30 p-6 sm:p-8 text-center space-y-4">
        <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <Crown className="w-8 h-8" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-xl font-bold text-white">No Active Main Quest Pinned</h3>
          <p className="text-xs text-slate-400">
            Pin your top S-Tier or Big Dream to the Grimoire Altar to focus your savings discipline.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          {activeDreams.length > 0 ? (
            <Button
              type="button"
              variant="gold"
              onClick={() => setIsSwitchModalOpen(true)}
            >
              <Pin className="w-4 h-4 mr-1.5" />
              Choose Main Quest
            </Button>
          ) : (
            <Button
              type="button"
              variant="gold"
              onClick={onOpenAddDream}
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              Inscribe First Dream
            </Button>
          )}
        </div>
      </div>
    );
  }

  const finalPrice = currentQuest.finalPrice || currentQuest.listedPrice || 0;
  const amountSaved = currentQuest.amountSaved || 0;
  const progressPercent = Math.min(100, Math.round((amountSaved / (finalPrice || 1)) * 100));
  const remaining = Math.max(0, finalPrice - amountSaved);

  return (
    <>
      <div
        onClick={() => onSelectQuest(currentQuest)}
        className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#14182b] via-[#0f1322] to-[#0a0d16] border-2 border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.25)] hover:border-amber-400/80 transition-all duration-500 cursor-pointer quest-aura-active"
      >
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 items-center relative z-10">
          {/* Left Media Hero */}
          <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-white/10 aspect-[16/10] sm:aspect-[4/3] bg-[#090c14] shadow-2xl">
            <SafeImage
              src={currentQuest.image}
              alt={currentQuest.name}
              category={currentQuest.category}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1322] via-transparent to-black/30" />

            {/* Badges on image */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <PriorityBadge priority={currentQuest.priority} size="md" showSublabel />
            </div>

            <div className="absolute top-3 right-3">
              <StatusBadge status={currentQuest.status} size="md" />
            </div>

            <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-xs font-black flex items-center gap-1.5 shadow-glow-gold">
              <Flame className="w-4 h-4 fill-black animate-bounce" />
              CURRENT MAIN QUEST
            </div>
          </div>

          {/* Right Details & Progress */}
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
                <span className="font-bold text-amber-400 uppercase tracking-widest text-[11px]">
                  {currentQuest.brand || currentQuest.category}
                  {currentQuest.variant ? ` • ${currentQuest.variant}` : ''}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSwitchModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-amber-300 font-semibold px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <Pin className="w-3.5 h-3.5" />
                  Switch Quest
                </button>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white group-hover:text-amber-300 transition-colors tracking-tight leading-snug">
                {currentQuest.name}
              </h2>

              {currentQuest.specs && (
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {currentQuest.specs}
                </p>
              )}
            </div>

            {/* Progress & Target Box */}
            <div className="p-4 rounded-2xl bg-[#090c16]/90 border border-white/10 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Target Acquisition Goal</span>
                  <span className="text-2xl font-black text-amber-300 font-mono">
                    {formatCurrency(finalPrice, currency)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Funded Progress</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono">
                    {progressPercent}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 rounded-full transition-all duration-700 shadow-glow-gold"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>Saved: <strong className="text-slate-200">{formatCurrency(amountSaved, currency)}</strong></span>
                  <span>Remaining: <strong className="text-amber-300">{formatCurrency(remaining, currency)}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-xs text-slate-400 hidden sm:inline-block">
                Click hero card to view full dossier & specs
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  type="button"
                  variant="gold"
                  size="md"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPurchaseClick(currentQuest);
                  }}
                  className="w-full sm:w-auto"
                >
                  <Trophy className="w-4 h-4 mr-1.5" />
                  I Bought This
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Switch Current Quest Modal */}
      <Modal
        isOpen={isSwitchModalOpen}
        onClose={() => setIsSwitchModalOpen(false)}
        maxWidth="lg"
        title={
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <span className="text-base font-bold text-white">Select Current Main Quest</span>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            Choose which active dream quest to feature on the main sanctuary altar:
          </p>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {activeDreams.map((d) => (
              <div
                key={d.id}
                onClick={() => handleSwitch(d.id)}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  d.id === currentQuest?.id
                    ? 'bg-amber-500/15 border-amber-500/40 shadow-glow-gold'
                    : 'bg-[#101424] border-white/5 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-white/10 flex-shrink-0">
                    <SafeImage
                      src={d.image}
                      alt={d.name}
                      category={d.category}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <PriorityBadge priority={d.priority} size="sm" />
                      <span className="text-xs font-bold text-white truncate">{d.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {formatCurrency(d.finalPrice || d.listedPrice || 0, currency)}
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {d.id === currentQuest?.id ? (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                      Active
                    </span>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      isLoading={isSwitching}
                    >
                      Pin
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
};
