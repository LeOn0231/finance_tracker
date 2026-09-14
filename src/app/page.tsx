'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { DreamPurchaseItem, DashboardStats } from '@/lib/types';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { SafeImage } from '@/components/ui/safe-image';
import { Button } from '@/components/ui/button';
import { DreamCard } from '@/components/dreams/dream-card';
import { AddDreamModal } from '@/components/dreams/add-dream-modal';
import { DreamDetailModal } from '@/components/dreams/dream-detail-modal';
import { PurchaseModal } from '@/components/dreams/purchase-modal';
import { CelebrationOverlay } from '@/components/celebration/celebration-overlay';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency, MONTH_NAMES } from '@/lib/finance-calculator';
import Link from 'next/link';
import {
  Sparkles,
  Crown,
  Compass,
  Trophy,
  DollarSign,
  TrendingUp,
  Wallet,
  Flame,
  Plus,
  ArrowUpRight,
  Shield,
  Layers,
  CheckCircle2,
  Lock,
  PiggyBank,
  ShoppingBag,
  Zap,
  ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dreams, setDreams] = useState<DreamPurchaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDream, setEditingDream] = useState<DreamPurchaseItem | null>(null);
  const [selectedDream, setSelectedDream] = useState<DreamPurchaseItem | null>(null);
  const [purchasingDream, setPurchasingDream] = useState<DreamPurchaseItem | null>(null);
  const [celebratingDream, setCelebratingDream] = useState<DreamPurchaseItem | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [statsRes, dreamsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/dreams'),
      ]);

      if (statsRes.ok) {
        const sData = await statsRes.json();
        setStats(sData.stats);
      }

      if (dreamsRes.ok) {
        const dData = await dreamsRes.json();
        setDreams(dData.dreams || []);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Save / Edit Dream
  const handleSaveDream = async (data: Partial<DreamPurchaseItem>) => {
    if (editingDream) {
      const res = await fetch(`/api/dreams/${editingDream.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update dream');
      }
    } else {
      const res = await fetch('/api/dreams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create dream');
      }
    }
    await fetchData();
  };

  // Handle Delete Dream
  const handleDeleteDream = async (dreamId: string) => {
    if (!confirm('Are you sure you want to remove this quest from your Grimoire?')) return;
    try {
      const res = await fetch(`/api/dreams/${dreamId}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedDream?.id === dreamId) setSelectedDream(null);
        await fetchData();
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  // Handle Toggle Pin
  const handleTogglePin = async (dreamId: string) => {
    try {
      const res = await fetch(`/api/dreams/${dreamId}/pin`, { method: 'POST' });
      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Pin failed:', error);
    }
  };

  // Handle Confirm Purchase
  const handleConfirmPurchase = async (
    dreamId: string,
    finalPrice: number,
    purchaseDate: string,
    notes?: string,
    recordInSpending: boolean = true
  ) => {
    const res = await fetch(`/api/dreams/${dreamId}/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'PURCHASE',
        finalPrice,
        purchaseDate,
        notes,
        recordInSpending,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setCelebratingDream(data.dream);
      await fetchData();
    }
  };

  const currentQuest = stats?.currentQuest;
  const currentQuestProgress = currentQuest
    ? Math.min(
        100,
        Math.round(
          ((currentQuest.amountSaved || 0) /
            (currentQuest.finalPrice || currentQuest.listedPrice || 1)) *
            100
        )
      )
    : 0;

  const finance = stats?.currentMonthFinance;

  const activeDreams = dreams.filter((d) => d.status !== 'PURCHASED');
  const bigDreams = activeDreams.filter((d) => d.type === 'BIG_DREAM');
  const smallDreams = activeDreams.filter((d) => d.type === 'SMALL_DREAM');

  return (
    <AppShell onOpenAddDream={() => { setEditingDream(null); setIsAddModalOpen(true); }}>
      <div className="space-y-8">
        {/* Welcome Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#141829] via-[#101422] to-[#181d33] border border-white/[0.08] p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Grimoire Active • Wizard King Path</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Life Quest Dashboard
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                Track your dream acquisitions, allocate savings, and conquer every tier of your ambition.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => {
                  setEditingDream(null);
                  setIsAddModalOpen(true);
                }}
                variant="gold"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-1.5" />
                Inscribe Dream
              </Button>
            </div>
          </div>
        </div>

        {/* COMPACT "THIS MONTH" FINANCE CARD (Requirement #15) */}
        {finance && (
          <div className="rounded-3xl bg-gradient-to-br from-[#121929] via-[#0f1422] to-[#0a0d16] border border-emerald-500/30 p-5 sm:p-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <Zap className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    THIS MONTH ({MONTH_NAMES[finance.month - 1]} {finance.year})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Active Safe-to-Spend cash flow and savings rate summary.
                  </p>
                </div>
              </div>

              <Link
                href="/money"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <span>Open Money Sanctuary</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Numbers Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#090c14] border border-white/5">
                <span className="text-[10px] text-emerald-400 uppercase block font-sans font-bold">Income</span>
                <span className="font-bold text-slate-200 text-sm">
                  ${finance.totalIncome.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#090c14] border border-white/5">
                <span className="text-[10px] text-rose-400 uppercase block font-sans font-bold">Fixed</span>
                <span className="font-bold text-slate-200 text-sm">
                  ${finance.fixedExpenses.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#090c14] border border-white/5">
                <span className="text-[10px] text-purple-400 uppercase block font-sans font-bold">Savings</span>
                <span className="font-bold text-purple-300 text-sm">
                  ${finance.savingsTarget.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#090c14] border border-white/5">
                <span className="text-[10px] text-amber-400 uppercase block font-sans font-bold">Spent</span>
                <span className="font-bold text-amber-300 text-sm">
                  ${finance.actualSpending.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#090c14] border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">Available</span>
                <span className="font-bold text-slate-200 text-sm">
                  ${finance.availableMoney.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#090c14] border border-white/5">
                <span className="text-[10px] text-sky-400 uppercase block font-sans font-bold">Buffer</span>
                <span className="font-bold text-sky-300 text-sm">
                  ${finance.safetyBuffer.toLocaleString()}
                </span>
              </div>

              <div className={`p-3 rounded-xl border col-span-2 sm:col-span-1 ${
                finance.safeToSpend < 0
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-glow-crimson'
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-glow-emerald'
              }`}>
                <span className="text-[10px] uppercase block font-sans font-bold">Safe To Spend</span>
                <span className="font-black text-sm">
                  ${finance.safeToSpend.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 7 Key Stats Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#121624]/90 border border-white/[0.08] shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">Total Dreams</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                {stats?.totalDreams ?? 0}
              </span>
              <span className="text-xs text-slate-500">quests</span>
            </div>
          </div>

          <Link
            href="/big-dreams"
            className="p-4 sm:p-5 rounded-2xl bg-[#121624]/90 border border-white/[0.08] hover:border-amber-500/40 transition-all hover:bg-surface-elevated shadow-lg flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-amber-400/90">Big Dreams</span>
              <Crown className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                {stats?.bigDreamsCount ?? 0}
              </span>
              <span className="text-xs text-slate-500">high-ticket</span>
            </div>
          </Link>

          <Link
            href="/small-dreams"
            className="p-4 sm:p-5 rounded-2xl bg-[#121624]/90 border border-white/[0.08] hover:border-purple-500/40 transition-all hover:bg-surface-elevated shadow-lg flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-purple-400/90">Small Dreams</span>
              <Compass className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-purple-300 font-mono">
                {stats?.smallDreamsCount ?? 0}
              </span>
              <span className="text-xs text-slate-500">gear & items</span>
            </div>
          </Link>

          <Link
            href="/purchased"
            className="p-4 sm:p-5 rounded-2xl bg-[#121624]/90 border border-white/[0.08] hover:border-teal-500/40 transition-all hover:bg-surface-elevated shadow-lg flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-teal-400/90">Purchased</span>
              <Trophy className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-teal-300 font-mono">
                {stats?.purchasedCount ?? 0}
              </span>
              <span className="text-xs text-teal-500/80 font-semibold">acquired</span>
            </div>
          </Link>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#101422] border border-white/[0.08] shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">Total Dream Value</span>
              <DollarSign className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-200 font-mono">
              ${(stats?.totalDreamValue ?? 0).toLocaleString()}
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#101422] border border-white/[0.08] shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-teal-400/90">Purchased Value</span>
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-teal-300 font-mono">
              ${(stats?.purchasedValue ?? 0).toLocaleString()}
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#181e35] to-[#101424] border border-amber-500/30 shadow-glow-gold col-span-2 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-amber-300 mb-2">
              <span className="font-bold uppercase tracking-wider">Remaining Quest Value</span>
              <Wallet className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                ${(stats?.remainingValue ?? 0).toLocaleString()}
              </div>
              <span className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider">
                Goal to Fund
              </span>
            </div>
          </div>
        </div>

        {/* FEATURED: CURRENT QUEST HERO CARD */}
        {currentQuest && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
                <span>Current Main Quest</span>
              </h2>
              <span className="text-xs font-mono text-amber-400 tracking-wider">ACTIVE FOCUS</span>
            </div>

            <div className="relative rounded-3xl bg-gradient-to-br from-[#161c30] via-[#101424] to-[#0c0f1a] border-2 border-amber-500/50 quest-aura-active p-6 sm:p-8 shadow-2xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-4 relative aspect-[16/10] md:aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  <SafeImage
                    src={currentQuest.image}
                    alt={currentQuest.name}
                    category={currentQuest.category}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <PriorityBadge priority={currentQuest.priority} size="md" showSublabel />
                  </div>
                </div>

                <div className="md:col-span-8 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <StatusBadge status={currentQuest.status} size="sm" />
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                        {currentQuest.category}
                      </span>
                      {currentQuest.brand && (
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                          {currentQuest.brand}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {currentQuest.name}
                    </h3>
                    {currentQuest.notes && (
                      <p className="text-xs sm:text-sm text-slate-300 mt-2 line-clamp-2">
                        {currentQuest.notes}
                      </p>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-[#090b12]/90 border border-white/10 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-400">Target Acquisition Value:</span>
                      <span className="text-2xl font-black text-amber-300 font-mono">
                        ${(currentQuest.finalPrice || currentQuest.listedPrice || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono text-slate-400">
                        <span>Funded: ${(currentQuest.amountSaved || 0).toLocaleString()}</span>
                        <span>{currentQuestProgress}% Complete</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${currentQuestProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setSelectedDream(currentQuest)}
                        variant="secondary"
                        size="md"
                      >
                        Inspect Dossier
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingDream(currentQuest);
                          setIsAddModalOpen(true);
                        }}
                        variant="ghost"
                        size="md"
                      >
                        Update Progress
                      </Button>
                    </div>

                    <Button
                      onClick={() => setPurchasingDream(currentQuest)}
                      variant="gold"
                      size="md"
                    >
                      <Trophy className="w-4 h-4 mr-1.5" />
                      I Bought This!
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BIG DREAMS PREVIEW SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <span>Big Dreams</span>
              </h2>
              <p className="text-xs text-slate-400">Vehicles, Battlestations, Tech & Grand Purchases</p>
            </div>
            <Link
              href="/big-dreams"
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <span>View All ({bigDreams.length})</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {bigDreams.length === 0 ? (
            <EmptyState
              type="BIG_DREAM"
              onAction={() => {
                setEditingDream(null);
                setIsAddModalOpen(true);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {bigDreams.slice(0, 3).map((dream) => (
                <DreamCard
                  key={dream.id}
                  dream={dream}
                  variant="big"
                  onSelect={setSelectedDream}
                  onEdit={(d) => {
                    setEditingDream(d);
                    setIsAddModalOpen(true);
                  }}
                  onDelete={handleDeleteDream}
                  onPurchaseClick={setPurchasingDream}
                  onTogglePin={handleTogglePin}
                />
              ))}
            </div>
          )}
        </div>

        {/* SMALL DREAMS PREVIEW SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-purple-400" />
                <span>Small Dreams</span>
              </h2>
              <p className="text-xs text-slate-400">Manga, Figures, Audio, Fashion & Accessories</p>
            </div>
            <Link
              href="/small-dreams"
              className="inline-flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
            >
              <span>View All ({smallDreams.length})</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {smallDreams.length === 0 ? (
            <EmptyState
              type="SMALL_DREAM"
              onAction={() => {
                setEditingDream(null);
                setIsAddModalOpen(true);
              }}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {smallDreams.slice(0, 4).map((dream) => (
                <DreamCard
                  key={dream.id}
                  dream={dream}
                  variant="small"
                  onSelect={setSelectedDream}
                  onEdit={(d) => {
                    setEditingDream(d);
                    setIsAddModalOpen(true);
                  }}
                  onDelete={handleDeleteDream}
                  onPurchaseClick={setPurchasingDream}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals & Overlays */}
      <AddDreamModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingDream(null);
        }}
        onSave={handleSaveDream}
        initialData={editingDream}
        onOpenExisting={(id) => {
          setIsAddModalOpen(false);
          const found = dreams.find((d) => d.id === id);
          if (found) setSelectedDream(found);
        }}
      />

      <DreamDetailModal
        dream={selectedDream}
        isOpen={Boolean(selectedDream)}
        onClose={() => setSelectedDream(null)}
        onEdit={(d) => {
          setSelectedDream(null);
          setEditingDream(d);
          setIsAddModalOpen(true);
        }}
        onDelete={handleDeleteDream}
        onPurchaseClick={(d) => {
          setSelectedDream(null);
          setPurchasingDream(d);
        }}
        onTogglePin={handleTogglePin}
        onDreamUpdated={fetchData}
      />

      <PurchaseModal
        dream={purchasingDream}
        isOpen={Boolean(purchasingDream)}
        onClose={() => setPurchasingDream(null)}
        safeToSpend={stats?.currentMonthFinance?.safeToSpend || 0}
        currency="USD"
        onConfirmPurchase={handleConfirmPurchase}
      />

      <CelebrationOverlay
        dream={celebratingDream}
        onClose={() => setCelebratingDream(null)}
      />
    </AppShell>
  );
}
