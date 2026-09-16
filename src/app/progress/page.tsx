'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { DashboardStats, DreamPurchaseItem } from '@/lib/types';
import { formatCurrency } from '@/lib/finance-calculator';
import { useTheme } from '@/lib/theme-context';
import {
  TrendingUp,
  Flame,
  Shield,
  Award,
  Sparkles,
  Crown,
  Trophy,
  Zap,
  Target,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

export default function ProgressPage() {
  const { currency, themeConfig } = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dreams, setDreams] = useState<DreamPurchaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch('/api/stats'), fetch('/api/dreams')])
      .then(async ([statsRes, dreamsRes]) => {
        if (statsRes.ok) {
          const sData = await statsRes.json();
          setStats(sData.stats);
        }
        if (dreamsRes.ok) {
          const dData = await dreamsRes.json();
          setDreams(dData.dreams || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  // Compute RPG Level and Rank
  const totalDreams = stats?.totalDreams || 0;
  const purchasedCount = stats?.purchasedCount || 0;
  const totalDreamValue = stats?.totalDreamValue || 0;
  const purchasedValue = stats?.purchasedValue || 0;

  // XP formula: 100 XP per dream inscribed + 500 XP per dream purchased + 1 XP per 100 currency saved/purchased
  const totalXP = totalDreams * 100 + purchasedCount * 500 + Math.round(purchasedValue / 100);
  const currentLevel = Math.max(1, Math.floor(Math.sqrt(totalXP / 50)) + 1);
  const nextLevelXP = Math.pow(currentLevel, 2) * 50;
  const prevLevelXP = Math.pow(currentLevel - 1, 2) * 50;
  const levelProgress = Math.min(
    100,
    Math.max(0, Math.round(((totalXP - prevLevelXP) / Math.max(1, nextLevelXP - prevLevelXP)) * 100))
  );

  const getRankTitle = (lvl: number) => {
    if (lvl >= 20) return 'Grand Magic Knight / Shadow Monarch';
    if (lvl >= 15) return 'Senior Magic Knight (1st Class)';
    if (lvl >= 10) return 'Senior Magic Knight (3rd Class)';
    if (lvl >= 5) return 'Intermediate Magic Knight';
    return 'Junior Magic Knight (Novice)';
  };

  const rankTitle = getRankTitle(currentLevel);

  return (
    <AppShell>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold">
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            <span>Mastery & RPG Leveling</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Wizard Knight Progression
          </h1>
          <p className="text-sm text-slate-400">
            Leveling trajectory, dream fulfillment velocity, and milestone milestones.
          </p>
        </div>

        {/* Level Hero Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#181a30] via-[#121626] to-[#0c0f18] border-2 border-amber-500/40 shadow-2xl space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 p-0.5 shadow-glow-gold flex-shrink-0">
                <div className="w-full h-full bg-[#0d101a] rounded-[14px] flex flex-col items-center justify-center">
                  <span className="text-[10px] text-amber-400 font-bold uppercase">LEVEL</span>
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono">{currentLevel}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    {themeConfig.series} Arc
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {rankTitle}
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Total Accumulated Experience: <strong className="text-amber-300">{totalXP.toLocaleString()} XP</strong>
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Fulfillment Ratio</span>
              <span className="text-2xl font-black text-teal-300 font-mono">
                {totalDreams > 0 ? Math.round((purchasedCount / totalDreams) * 100) : 0}%
              </span>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="space-y-1.5 relative z-10 pt-2 border-t border-white/10">
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>Next Level Threshold: {totalXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP</span>
              <span className="text-amber-300 font-bold">{levelProgress}% to Level {currentLevel + 1}</span>
            </div>
            <div className="w-full h-3 bg-slate-800/80 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 rounded-full transition-all duration-700 shadow-glow-gold"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3 Progression Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-[#121624]/90 border border-white/10 shadow-lg space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Active Questing Focus</h3>
              <p className="text-xs text-slate-400">
                {stats?.currentQuest
                  ? `Focusing on: ${stats.currentQuest.name}`
                  : 'No active quest currently pinned.'}
              </p>
            </div>
            <div className="pt-2 border-t border-white/5 text-xs text-amber-400 font-mono font-bold">
              {stats?.currentQuest ? formatCurrency(stats.currentQuest.finalPrice || 0, currency) : '—'}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#121624]/90 border border-white/10 shadow-lg space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Discipline Velocity</h3>
              <p className="text-xs text-slate-400">
                Tracking monthly commitments, safe-to-spend limits, and dream savings.
              </p>
            </div>
            <div className="pt-2 border-t border-white/5 text-xs text-purple-300 font-mono font-bold">
              Active Grimoire Discipline
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#121624]/90 border border-white/10 shadow-lg space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-teal-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Hall of Fame Trophies</h3>
              <p className="text-xs text-slate-400">
                {purchasedCount} dreams conquered with {formatCurrency(purchasedValue, currency)} invested.
              </p>
            </div>
            <div className="pt-2 border-t border-white/5 text-xs text-teal-300 font-mono font-bold">
              <Link href="/purchased" className="hover:underline flex items-center gap-1">
                <span>View Hall of Fame</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
