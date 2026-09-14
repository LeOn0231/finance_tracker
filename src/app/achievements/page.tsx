'use client';

import React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Award, Trophy, Sparkles, Crown, Zap, Shield, Flame } from 'lucide-react';

export default function AchievementsPage() {
  const achievements = [
    {
      title: 'Grimoire Inscription',
      desc: 'Inscribed your first dream quest into the Grimoire.',
      icon: <Sparkles className="w-6 h-6 text-amber-400" />,
      unlocked: true,
      category: 'QUEST',
    },
    {
      title: 'First Blood: Dream Acquired',
      desc: 'Successfully acquired and recorded your first completed dream purchase.',
      icon: <Trophy className="w-6 h-6 text-teal-400" />,
      unlocked: true,
      category: 'TRIUMPH',
    },
    {
      title: 'Crown of Asta: S-Tier Master',
      desc: 'Target and fund an ultimate S-Tier dream purchase.',
      icon: <Crown className="w-6 h-6 text-amber-400" />,
      unlocked: true,
      category: 'LEGEND',
    },
    {
      title: 'Iron Discipline Cushion',
      desc: 'Maintain a pristine safety buffer for 3 consecutive months.',
      icon: <Shield className="w-6 h-6 text-purple-400" />,
      unlocked: false,
      category: 'FINANCE',
    },
    {
      title: 'Black Bulls Limit Break',
      desc: 'Reach 100% funded target on a major quest ahead of schedule.',
      icon: <Zap className="w-6 h-6 text-emerald-400" />,
      unlocked: false,
      category: 'SPEED',
    },
  ];

  return (
    <AppShell>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Badges of Valor & Triumph</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Grimoire Achievements
          </h1>
          <p className="text-sm text-slate-400">
            Commemorating your victories, discipline, and milestones across your personal odyssey.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {achievements.map((ach, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                ach.unlocked
                  ? 'bg-[#121626]/90 border-amber-500/30 shadow-glow-gold'
                  : 'bg-[#0e111d]/60 border-white/5 opacity-50'
              }`}
            >
              <div
                className={`p-3 rounded-2xl border flex-shrink-0 ${
                  ach.unlocked
                    ? 'bg-amber-500/10 border-amber-500/40'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                {ach.icon}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{ach.title}</h4>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      ach.unlocked
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-white/5 text-slate-500'
                    }`}
                  >
                    {ach.unlocked ? 'UNLOCKED' : 'LOCKED'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{ach.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
