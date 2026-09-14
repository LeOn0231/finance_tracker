'use client';

import React from 'react';
import { FinancialMonthCalculations } from '@/lib/types';
import { formatCurrency } from '@/lib/finance-calculator';
import {
  Wallet,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  Zap,
  ArrowDownRight,
  PiggyBank,
  Sparkles,
  Lock,
  ShoppingBag,
  Percent,
} from 'lucide-react';

interface FinanceOverviewCardsProps {
  calculated: FinancialMonthCalculations;
  currency?: string;
  onOpenSettings?: () => void;
}

export const FinanceOverviewCards: React.FC<FinanceOverviewCardsProps> = ({
  calculated,
  currency = 'INR',
  onOpenSettings,
}) => {
  const isSafeDeficit = calculated.safeToSpend < 0;
  const isAvailableDeficit = calculated.availableMoney < 0;

  return (
    <div className="space-y-4">
      {/* Primary Safe-to-Spend & Available Hero Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* SAFE TO SPEND HERO */}
        <div
          className={`lg:col-span-7 relative overflow-hidden rounded-3xl p-6 sm:p-7 border transition-all duration-300 shadow-2xl flex flex-col justify-between ${
            isSafeDeficit
              ? 'bg-gradient-to-br from-[#241216] via-[#1a0f14] to-[#0f0a0d] border-rose-500/50 shadow-glow-crimson'
              : 'bg-gradient-to-br from-[#122421] via-[#0f1a18] to-[#0a1210] border-emerald-500/40 shadow-glow-emerald'
          }`}
        >
          {/* Decorative aura */}
          <div
            className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
              isSafeDeficit ? 'bg-rose-500/10' : 'bg-emerald-500/15'
            }`}
          />

          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold tracking-wider uppercase">
                {isSafeDeficit ? (
                  <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                ) : (
                  <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                )}
                <span>{isSafeDeficit ? 'Safe Limit Exceeded' : 'Active Safe-To-Spend'}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Formula Verified</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white drop-shadow-md">
              {formatCurrency(calculated.safeToSpend, currency)}
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed max-w-lg">
              {isSafeDeficit
                ? 'Your discretionary spending and savings target currently exceed safe limits. Consider pausing non-essential purchases.'
                : 'Money available for guilt-free small dreams, dining, and discretionary joy without touching your savings or safety cushion.'}
            </p>
          </div>

          {/* Breakdown Mini Bar */}
          <div className="pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-xs relative z-10">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Available</span>
              <span className={`font-mono font-bold ${isAvailableDeficit ? 'text-rose-400' : 'text-slate-200'}`}>
                {formatCurrency(calculated.availableMoney, currency)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Safety Buffer</span>
              <span className="font-mono font-bold text-sky-300">
                {formatCurrency(calculated.safetyBuffer, currency)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Savings Rate</span>
              <span className="font-mono font-bold text-purple-300">
                {calculated.savingsRate}%
              </span>
            </div>
          </div>
        </div>

        {/* DREAM BUDGET / TARGET CARD */}
        <div className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-[#181d33] via-[#121626] to-[#0c0f18] border border-amber-500/30 p-6 sm:p-7 shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Monthly Dream Budget</span>
            </div>
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="text-xs text-slate-400 hover:text-amber-300 transition-colors"
              >
                Configure
              </button>
            )}
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs text-slate-400">Budget Limit:</span>
              <span className="text-xl font-bold text-white font-mono">
                {formatCurrency(calculated.dreamBudget, currency)}
              </span>
            </div>

            <div className="flex items-baseline justify-between text-xs text-slate-400">
              <span>Dream Acquisitions:</span>
              <span className="font-bold text-teal-300 font-mono">
                {formatCurrency(calculated.dreamBudgetUsed, currency)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 space-y-1">
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      calculated.dreamBudget > 0
                        ? Math.round((calculated.dreamBudgetUsed / calculated.dreamBudget) * 100)
                        : 0
                    )}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-1">
                <span>Remaining: {formatCurrency(calculated.dreamBudgetRemaining, currency)}</span>
                <span>
                  {calculated.dreamBudget > 0
                    ? Math.round((calculated.dreamBudgetUsed / calculated.dreamBudget) * 100)
                    : 0}
                  % Used
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Separate quota dedicated specifically for small dream purchases this month.
          </p>
        </div>
      </div>

      {/* 4 Core Financial Pillar Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Total Income */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121624]/90 border border-white/[0.08] shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-emerald-400/90">Total Income</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-300 font-mono">
            {formatCurrency(calculated.totalIncome, currency)}
          </div>
        </div>

        {/* 2. Fixed Expenses */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121624]/90 border border-white/[0.08] shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-rose-400/90">Fixed Expenses</span>
            <Lock className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-300 font-mono">
            {formatCurrency(calculated.fixedExpenses, currency)}
          </div>
        </div>

        {/* 3. Savings Target */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121624]/90 border border-white/[0.08] shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-purple-400/90">Savings Target</span>
            <PiggyBank className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-300 font-mono">
            {formatCurrency(calculated.savingsTarget, currency)}
          </div>
        </div>

        {/* 4. Actual Spending */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121624]/90 border border-white/[0.08] shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-amber-400/90">Additional Spent</span>
            <ShoppingBag className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
            {formatCurrency(calculated.actualSpending, currency)}
          </div>
        </div>
      </div>
    </div>
  );
};
