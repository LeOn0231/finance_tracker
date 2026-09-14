'use client';

import React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { TrendingUp, Flame, Shield, Award, Sparkles } from 'lucide-react';

export default function ProgressPage() {
  return (
    <AppShell>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold">
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            <span>Quest Mastery & Progression</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Wizard Knight Progress
          </h1>
          <p className="text-sm text-slate-400">
            Leveling trajectory, dream fulfillment velocity, and milestone milestones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-[#121624] border border-white/10 shadow-lg space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-3">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-base font-bold text-white">Rank & Magic Knight Tier</h3>
            <p className="text-xs text-slate-400">
              Current Rank: <span className="text-amber-400 font-bold">1st Class Senior Magic Knight</span>
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#121624] border border-white/10 shadow-lg space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mb-3">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-base font-bold text-white">Discipline Streak</h3>
            <p className="text-xs text-slate-400">
              Active Focus: <span className="text-purple-300 font-bold">14 Days Consecutive Questing</span>
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#121624] border border-white/10 shadow-lg space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center mb-3">
              <Award className="w-5 h-5 text-teal-400" />
            </div>
            <h3 className="text-base font-bold text-white">Goal Velocity</h3>
            <p className="text-xs text-slate-400">
              Fulfillment Rate: <span className="text-teal-300 font-bold">On Target for 2026 Goals</span>
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
