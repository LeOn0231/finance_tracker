'use client';

import React from 'react';
import { FinancialMonthData } from '@/lib/types';
import { formatCurrency, MONTH_NAMES } from '@/lib/finance-calculator';
import { Trophy, Percent, TrendingUp, PiggyBank, Lock, ShoppingBag, ShieldCheck, PieChart, Sparkles } from 'lucide-react';

interface MonthReviewProps {
  data: FinancialMonthData;
  currency?: string;
}

export const MonthReview: React.FC<MonthReviewProps> = ({ data, currency = 'INR' }) => {
  const { calculated } = data;

  // Group spending by category
  const spendingByCategory: Record<string, number> = {};
  data.expenses
    .filter((e) => e.type === 'ADDITIONAL_SPENDING')
    .forEach((e) => {
      spendingByCategory[e.category] = (spendingByCategory[e.category] || 0) + e.amount;
    });

  const fixedByCategory: Record<string, number> = {};
  data.expenses
    .filter((e) => e.type === 'FIXED')
    .forEach((e) => {
      fixedByCategory[e.category] = (fixedByCategory[e.category] || 0) + e.amount;
    });

  const monthLabel = `${MONTH_NAMES[data.month - 1]} ${data.year}`;

  return (
    <div className="space-y-6">
      {/* Month Review Header Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#141b2f] via-[#101424] to-[#0c0f18] border border-amber-500/40 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold mb-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Grimoire Monthly Review</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {monthLabel} Financial Assessment
            </h2>
          </div>

          <div className="p-3 rounded-2xl bg-[#090b12] border border-white/10 text-right">
            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">
              Overall Savings Rate
            </span>
            <span className="text-2xl font-black text-purple-300 font-mono">
              {calculated.savingsRate}%
            </span>
          </div>
        </div>

        {/* 6 Key Review Numbers Table */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-white/10">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-0.5">
            <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Inflow
            </span>
            <span className="text-base font-bold text-emerald-300 font-mono block">
              {formatCurrency(calculated.totalIncome, currency)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-0.5">
            <span className="text-[10px] text-rose-400 uppercase tracking-wider font-bold flex items-center gap-1">
              <Lock className="w-3 h-3" /> Fixed
            </span>
            <span className="text-base font-bold text-rose-300 font-mono block">
              {formatCurrency(calculated.fixedExpenses, currency)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-0.5">
            <span className="text-[10px] text-purple-400 uppercase tracking-wider font-bold flex items-center gap-1">
              <PiggyBank className="w-3 h-3" /> Savings
            </span>
            <span className="text-base font-bold text-purple-300 font-mono block">
              {formatCurrency(calculated.savingsTarget, currency)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-0.5">
            <span className="text-[10px] text-amber-400 uppercase tracking-wider font-bold flex items-center gap-1">
              <ShoppingBag className="w-3 h-3" /> Spent
            </span>
            <span className="text-base font-bold text-amber-300 font-mono block">
              {formatCurrency(calculated.actualSpending, currency)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-0.5">
            <span className="text-[10px] text-teal-400 uppercase tracking-wider font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Dreams
            </span>
            <span className="text-base font-bold text-teal-300 font-mono block">
              {formatCurrency(calculated.dreamSpending, currency)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-0.5">
            <span className="text-[10px] text-sky-400 uppercase tracking-wider font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Remaining
            </span>
            <span className={`text-base font-bold font-mono block ${calculated.safeToSpend < 0 ? 'text-rose-400' : 'text-sky-300'}`}>
              {formatCurrency(calculated.safeToSpend, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Spending Breakdown Categorization Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Discretionary Spending Categories */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#121624]/90 border border-white/[0.08] shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            <span>Additional Spending Breakdown</span>
          </h3>

          {Object.keys(spendingByCategory).length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No additional transactions recorded.</p>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(spendingByCategory).map(([cat, amt]) => {
                const pct = calculated.actualSpending > 0 ? Math.round((amt / calculated.actualSpending) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>{cat}</span>
                      <span className="font-mono font-bold">{formatCurrency(amt, currency)} ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Fixed Expenses Breakdown */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#121624]/90 border border-white/[0.08] shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>Fixed Commitments Breakdown</span>
          </h3>

          {Object.keys(fixedByCategory).length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No fixed obligations recorded.</p>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(fixedByCategory).map(([cat, amt]) => {
                const pct = calculated.fixedExpenses > 0 ? Math.round((amt / calculated.fixedExpenses) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>{cat}</span>
                      <span className="font-mono font-bold">{formatCurrency(amt, currency)} ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
