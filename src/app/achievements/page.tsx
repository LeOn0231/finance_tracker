'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { EvaluatedAchievement } from '@/lib/achievements';
import { sounds } from '@/lib/sound';
import {
  Award,
  Trophy,
  Sparkles,
  Crown,
  Zap,
  Shield,
  Flame,
  Layers,
  Lock,
  CheckCircle2,
  Filter,
} from 'lucide-react';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<EvaluatedAchievement[]>([]);
  const [stats, setStats] = useState<{
    unlockedCount: number;
    totalCount: number;
    completionPercentage: number;
  }>({
    unlockedCount: 0,
    totalCount: 0,
    completionPercentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    fetch('/api/achievements')
      .then((res) => res.json())
      .then((data) => {
        if (data.achievements) {
          setAchievements(data.achievements);
          setStats(data.stats);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const getIcon = (iconName: string, unlocked: boolean) => {
    const colorClass = unlocked ? 'text-amber-400' : 'text-slate-500';
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className={`w-6 h-6 ${colorClass}`} />;
      case 'Trophy':
        return <Trophy className={`w-6 h-6 ${unlocked ? 'text-teal-400' : 'text-slate-500'}`} />;
      case 'Flame':
        return <Flame className={`w-6 h-6 ${unlocked ? 'text-rose-400' : 'text-slate-500'}`} />;
      case 'Layers':
        return <Layers className={`w-6 h-6 ${unlocked ? 'text-purple-400' : 'text-slate-500'}`} />;
      case 'Crown':
        return <Crown className={`w-6 h-6 ${colorClass}`} />;
      case 'Shield':
        return <Shield className={`w-6 h-6 ${unlocked ? 'text-blue-400' : 'text-slate-500'}`} />;
      default:
        return <Award className={`w-6 h-6 ${colorClass}`} />;
    }
  };

  const categories = [
    { id: 'ALL', label: 'All Badges' },
    { id: 'QUEST', label: 'Quest & Inscription' },
    { id: 'TRIUMPH', label: 'Triumph & Acquisitions' },
    { id: 'SAVINGS', label: 'Discipline & Vault' },
    { id: 'LEGEND', label: 'Legendary Feats' },
  ];

  const filteredAchievements = achievements.filter((ach) => {
    if (selectedCategory === 'ALL') return true;
    return ach.category === selectedCategory;
  });

  return (
    <AppShell>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header with Achievement Score Bar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Badges of Valor & Triumph</span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              <span className="text-amber-300 font-bold">{stats.unlockedCount}</span> of {stats.totalCount} Unlocked ({stats.completionPercentage}%)
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Grimoire Achievements
          </h1>
          <p className="text-sm text-slate-400">
            Commemorating your milestones, financial discipline, and victories across your personal quest.
          </p>

          {/* Master Progress Bar */}
          <div className="p-4 rounded-2xl bg-[#121624]/90 border border-white/10 shadow-lg space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                Mastery Completion Rate
              </span>
              <span className="font-mono text-amber-300 font-bold">{stats.completionPercentage}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-all duration-700 rounded-full shadow-glow-gold"
                style={{ width: `${stats.completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                sounds.playClick();
                setSelectedCategory(cat.id);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedCategory === cat.id
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-glow-gold'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200 border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredAchievements.map((ach) => {
            const isProgressRelevant = ach.maxProgress > 1;
            const progressPercent = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));

            return (
              <div
                key={ach.code}
                className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-3 ${
                  ach.unlocked
                    ? 'bg-[#121626]/90 border-amber-500/30 shadow-glow-gold'
                    : 'bg-[#0e111d]/70 border-white/5 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3.5 rounded-2xl border flex-shrink-0 transition-transform ${
                      ach.unlocked
                        ? 'bg-amber-500/10 border-amber-500/40 shadow-glow-gold'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    {getIcon(ach.icon, ach.unlocked)}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white leading-snug">{ach.title}</h4>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                          ach.unlocked
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-white/5 text-slate-500 border border-white/5'
                        }`}
                      >
                        {ach.unlocked ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            UNLOCKED
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-slate-500" />
                            LOCKED
                          </>
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{ach.description}</p>
                  </div>
                </div>

                {/* Progress bar for multi-step achievements */}
                {isProgressRelevant && !ach.unlocked && (
                  <div className="pt-2 border-t border-white/5 space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                      <span>Progress:</span>
                      <span>{ach.progress.toLocaleString()} / {ach.maxProgress.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500/60 rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {ach.unlockedAt && (
                  <div className="text-[10px] text-slate-500 font-mono pt-1">
                    Unlocked on {new Date(ach.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
