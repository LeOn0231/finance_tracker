'use client';

import React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Wallet, ShieldCheck, TrendingUp, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function MoneyPage() {
  return (
    <AppShell>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Phase 3 Foundation Ready</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Financial Sanctuary & Safe-To-Spend
          </h1>
          <p className="text-sm text-slate-400">
            Precision mathematical framework separating income, recurring expenses, buffer protection, and dream allocations.
          </p>
        </div>

        {/* Formula Showcase Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#121929] via-[#0f1422] to-[#0a0d16] border border-amber-500/30 shadow-2xl space-y-6">
          <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>The Core Life Quest Financial Formula</span>
          </h3>

          <div className="p-5 rounded-2xl bg-[#080b12] border border-white/10 font-mono text-sm space-y-3">
            <div className="text-emerald-400 font-bold flex justify-between">
              <span>+ Total Monthly Income</span>
              <span>$5,000.00</span>
            </div>
            <div className="text-rose-400 flex justify-between">
              <span>− Fixed Recurring Expenses</span>
              <span>$1,800.00</span>
            </div>
            <div className="text-purple-400 flex justify-between">
              <span>− Core Savings Target</span>
              <span>$1,200.00</span>
            </div>
            <div className="text-slate-400 flex justify-between">
              <span>− Actual Additional Spending</span>
              <span>$500.00</span>
            </div>
            <div className="h-0.5 bg-white/20 my-2" />
            <div className="text-amber-300 font-bold flex justify-between text-base">
              <span>= Available Money</span>
              <span>$1,500.00</span>
            </div>
            <div className="text-sky-400 flex justify-between">
              <span>− Safety Buffer Cushion</span>
              <span>$800.00</span>
            </div>
            <div className="h-0.5 bg-amber-500/40 my-2" />
            <div className="text-emerald-300 font-black text-lg flex justify-between bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/30">
              <span>⚡ SAFE TO SPEND ON DREAMS</span>
              <span>$700.00</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Database models <code className="text-amber-400 bg-white/5 px-1 py-0.5 rounded">FinancialMonth</code>, <code className="text-amber-400 bg-white/5 px-1 py-0.5 rounded">Expense</code>, and <code className="text-amber-400 bg-white/5 px-1 py-0.5 rounded">PurchaseTransaction</code> are active and seeded in the database. Full interactive ledger tools activate in Phase 3.
          </p>

          <Link href="/">
            <Button variant="gold" size="md">
              <span>Return to Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
