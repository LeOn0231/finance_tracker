'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { FinancialMonthData, DreamPurchaseItem } from '@/lib/types';
import { FinanceOverviewCards } from '@/components/finance/finance-overview-cards';
import { IncomeManager } from '@/components/finance/income-manager';
import { FixedExpenseManager } from '@/components/finance/fixed-expense-manager';
import { SpendingManager } from '@/components/finance/spending-manager';
import { SavingsAllocator } from '@/components/finance/savings-allocator';
import { MonthReview } from '@/components/finance/month-review';
import { FinanceCharts } from '@/components/finance/finance-charts';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, MONTH_NAMES } from '@/lib/finance-calculator';
import {
  Wallet,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Settings,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Trophy,
  Sliders,
  DollarSign,
  Plus,
} from 'lucide-react';

export default function MoneyPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'REVIEW' | 'CHARTS'>('OVERVIEW');
  const [monthData, setMonthData] = useState<FinancialMonthData | null>(null);
  const [bigDreams, setBigDreams] = useState<DreamPurchaseItem[]>([]);
  const [allDreams, setAllDreams] = useState<DreamPurchaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Settings / Config Modal State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [safetyBufferInput, setSafetyBufferInput] = useState('');
  const [dreamBudgetInput, setDreamBudgetInput] = useState('');
  const [currencyInput, setCurrencyInput] = useState('INR');
  const [notesInput, setNotesInput] = useState('');
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const fetchMonthData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [monthRes, dreamsRes] = await Promise.all([
        fetch(`/api/finance/month?month=${selectedMonth}&year=${selectedYear}`),
        fetch('/api/dreams'),
      ]);

      if (monthRes.ok) {
        const mData = await monthRes.json();
        setMonthData(mData.monthData);
        setSafetyBufferInput(String(mData.monthData.safetyBuffer || 800));
        setDreamBudgetInput(String(mData.monthData.dreamBudget || 500));
        setCurrencyInput(mData.monthData.currency || 'INR');
        setNotesInput(mData.monthData.notes || '');
      }

      if (dreamsRes.ok) {
        const dData = await dreamsRes.json();
        const dList: DreamPurchaseItem[] = dData.dreams || [];
        setAllDreams(dList);
        setBigDreams(dList.filter((d) => d.type === 'BIG_DREAM' && d.status !== 'PURCHASED'));
      }
    } catch (error) {
      console.error('Failed to load finance data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchMonthData();
  }, [fetchMonthData]);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const handleUpdateSavingsTarget = async (newTarget: number) => {
    await fetch(`/api/finance/month?month=${selectedMonth}&year=${selectedYear}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ savingsTarget: newTarget }),
    });
    await fetchMonthData();
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    try {
      await fetch(`/api/finance/month?month=${selectedMonth}&year=${selectedYear}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          safetyBuffer: parseFloat(safetyBufferInput) || 0,
          dreamBudget: parseFloat(dreamBudgetInput) || 0,
          currency: currencyInput,
          notes: notesInput.trim() || null,
        }),
      });
      setIsConfigModalOpen(false);
      await fetchMonthData();
    } catch (error) {
      console.error('Failed to save config:', error);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const currentCurrency = monthData?.currency || 'INR';

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Month Switcher & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Wallet className="w-6 h-6 text-amber-400" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Financial Command Center
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Income → Fixed Obligations → Savings → Discretionary Cash Flow → Safe-to-Spend.
            </p>
          </div>

          {/* Month Switcher Controls */}
          <div className="flex items-center gap-2 bg-[#121624] p-1.5 rounded-2xl border border-white/10 self-start md:self-auto shadow-lg">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-3 py-1 flex items-center gap-2 font-mono text-xs sm:text-sm font-bold text-amber-300 select-none">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>
                {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
              </span>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-white/10 transition-colors border-l border-white/10 ml-1"
              title="Month Settings & Safety Buffer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'OVERVIEW'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-glow-gold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Monthly Ledger & Safe-to-Spend</span>
          </button>

          <button
            onClick={() => setActiveTab('REVIEW')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'REVIEW'
                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-glow-violet'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Monthly Review</span>
          </button>

          <button
            onClick={() => setActiveTab('CHARTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'CHARTS'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-glow-emerald'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Financial Trajectory</span>
          </button>
        </div>

        {/* Tab Contents */}
        {isLoading || !monthData ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400 font-mono">Calibrating financial grimoire...</p>
          </div>
        ) : (
          <>
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-6">
                {/* 1. Primary Metrics Header */}
                <FinanceOverviewCards
                  calculated={monthData.calculated}
                  currency={currentCurrency}
                  onOpenSettings={() => setIsConfigModalOpen(true)}
                />

                {/* 2. Incomes & Fixed Expenses Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <IncomeManager
                    financialMonthId={monthData.id}
                    incomes={monthData.incomes}
                    currency={currentCurrency}
                    onRefresh={fetchMonthData}
                  />

                  <FixedExpenseManager
                    financialMonthId={monthData.id}
                    expenses={monthData.expenses}
                    currency={currentCurrency}
                    onRefresh={fetchMonthData}
                  />
                </div>

                {/* 3. Savings Target & Discretionary Spending */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SavingsAllocator
                    financialMonthId={monthData.id}
                    savingsTarget={monthData.savingsTarget}
                    allocations={monthData.allocations}
                    bigDreams={bigDreams}
                    currency={currentCurrency}
                    onUpdateTarget={handleUpdateSavingsTarget}
                    onRefresh={fetchMonthData}
                  />

                  <SpendingManager
                    financialMonthId={monthData.id}
                    expenses={monthData.expenses}
                    dreams={allDreams}
                    currency={currentCurrency}
                    onRefresh={fetchMonthData}
                  />
                </div>
              </div>
            )}

            {activeTab === 'REVIEW' && (
              <MonthReview data={monthData} currency={currentCurrency} />
            )}

            {activeTab === 'CHARTS' && (
              <FinanceCharts currency={currentCurrency} />
            )}
          </>
        )}
      </div>

      {/* Month Config Modal */}
      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        title="Month Parameters & Safety Buffer"
        maxWidth="md"
      >
        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Minimum Safety Buffer
              </label>
              <Input
                type="number"
                step="any"
                value={safetyBufferInput}
                onChange={(e) => setSafetyBufferInput(e.target.value)}
                placeholder="e.g. 10000"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Monthly Dream Budget
              </label>
              <Input
                type="number"
                step="any"
                value={dreamBudgetInput}
                onChange={(e) => setDreamBudgetInput(e.target.value)}
                placeholder="e.g. 10000"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Currency
            </label>
            <select
              value={currencyInput}
              onChange={(e) => setCurrencyInput(e.target.value)}
              className="w-full bg-[#0d101a]/90 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
            >
              <option value="INR">₹ INR (Indian Rupee)</option>
              <option value="USD">$ USD (US Dollar)</option>
              <option value="EUR">€ EUR (Euro)</option>
              <option value="GBP">£ GBP (British Pound)</option>
              <option value="JPY">¥ JPY (Japanese Yen)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Month Quest Notes / Strategy
            </label>
            <textarea
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="e.g. Focus on aggressive savings for motorcycle while maintaining safety buffer."
              rows={2}
              className="w-full bg-[#0d101a]/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsConfigModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gold" isLoading={isSavingConfig}>
              Save Settings
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
