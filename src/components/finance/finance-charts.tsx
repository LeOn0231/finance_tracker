'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { formatCurrency } from '@/lib/finance-calculator';
import { TrendingUp, BarChart3, Layers, Calendar } from 'lucide-react';

interface HistoryMonth {
  id: string;
  month: number;
  year: number;
  label: string;
  income: number;
  fixedExpenses: number;
  savings: number;
  discretionarySpending: number;
  dreamSpending: number;
  available: number;
  safeToSpend: number;
  savingsRate: number;
}

interface FinanceChartsProps {
  currency?: string;
}

export const FinanceCharts: React.FC<FinanceChartsProps> = ({ currency = 'INR' }) => {
  const [range, setRange] = useState<string>('6m');
  const [history, setHistory] = useState<HistoryMonth[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/finance/history?range=${range}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to fetch finance history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const maxVal = Math.max(
    ...history.map((h) => Math.max(h.income, h.fixedExpenses + h.savings + h.discretionarySpending)),
    1000
  );

  return (
    <div className="rounded-3xl bg-[#121624]/90 border border-white/[0.08] p-5 sm:p-7 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <span>Financial Trajectory & History</span>
          </h3>
          <p className="text-xs text-slate-400">
            Chronological multi-month overview of income, savings, obligations, and discretionary cash flow.
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex rounded-xl bg-[#0b0e18] p-1 border border-white/10 self-start sm:self-auto">
          {(['1m', '3m', '6m', '12m', 'all'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                range === r
                  ? 'bg-amber-500 text-black shadow-glow-gold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-xs text-slate-400 font-mono">
          <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Rendering financial charts...
        </div>
      ) : history.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400">
          No historical records found for this period.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium border-b border-white/5 pb-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-glow-emerald" />
              <span className="text-slate-300">Income Inflow</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="text-slate-300">Fixed Expenses</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-400" />
              <span className="text-slate-300">Savings Target</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-slate-300">Additional Spent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-sky-400" />
              <span className="text-slate-300">Safe to Spend</span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((item) => {
              const incomeHeight = Math.min(100, Math.round((item.income / maxVal) * 100));
              const fixedPct = item.income > 0 ? Math.round((item.fixedExpenses / item.income) * 100) : 0;
              const savingsPct = item.income > 0 ? Math.round((item.savings / item.income) * 100) : 0;
              const spentPct = item.income > 0 ? Math.round((item.discretionarySpending / item.income) * 100) : 0;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#0c0f18] border border-white/5 hover:border-amber-500/30 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      {item.label}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono font-bold">
                      {item.savingsRate}% Saved
                    </span>
                  </div>

                  {/* Visual Stacked Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-rose-400"
                        style={{ width: `${Math.min(100, fixedPct)}%` }}
                        title={`Fixed: ${fixedPct}%`}
                      />
                      <div
                        className="h-full bg-purple-400"
                        style={{ width: `${Math.min(100, savingsPct)}%` }}
                        title={`Savings: ${savingsPct}%`}
                      />
                      <div
                        className="h-full bg-amber-400"
                        style={{ width: `${Math.min(100, spentPct)}%` }}
                        title={`Spent: ${spentPct}%`}
                      />
                    </div>
                  </div>

                  {/* Summary Metric Rows */}
                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Total Income:</span>
                      <span className="text-emerald-300 font-bold">{formatCurrency(item.income, currency)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Fixed + Savings:</span>
                      <span className="text-slate-300">{formatCurrency(item.fixedExpenses + item.savings, currency)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Additional Spent:</span>
                      <span className="text-amber-300">{formatCurrency(item.discretionarySpending, currency)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 pt-1 border-t border-white/5 font-semibold">
                      <span>Safe to Spend:</span>
                      <span className={item.safeToSpend < 0 ? 'text-rose-400 font-bold' : 'text-sky-300 font-bold'}>
                        {formatCurrency(item.safeToSpend, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
