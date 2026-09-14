'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { DreamPurchaseItem, DREAM_CATEGORIES } from '@/lib/types';
import { DreamCard } from '@/components/dreams/dream-card';
import { AddDreamModal } from '@/components/dreams/add-dream-modal';
import { DreamDetailModal } from '@/components/dreams/dream-detail-modal';
import { PurchaseModal } from '@/components/dreams/purchase-modal';
import { CelebrationOverlay } from '@/components/celebration/celebration-overlay';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/finance-calculator';
import {
  Compass,
  Search,
  Plus,
  ArrowUpDown,
  Filter,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export default function SmallDreamsPage() {
  const [dreams, setDreams] = useState<DreamPurchaseItem[]>([]);
  const [safeToSpend, setSafeToSpend] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('INR');
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('NOT_PURCHASED');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('recent');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDream, setEditingDream] = useState<DreamPurchaseItem | null>(null);
  const [selectedDream, setSelectedDream] = useState<DreamPurchaseItem | null>(null);
  const [purchasingDream, setPurchasingDream] = useState<DreamPurchaseItem | null>(null);
  const [celebratingDream, setCelebratingDream] = useState<DreamPurchaseItem | null>(null);

  const fetchDreamsAndFinance = useCallback(async () => {
    try {
      setIsLoading(true);
      const now = new Date();
      const params = new URLSearchParams({
        type: 'SMALL_DREAM',
        status: statusFilter,
        priority: priorityFilter,
        category: categoryFilter,
        search: searchQuery,
        sortBy,
      });

      const [dreamsRes, financeRes] = await Promise.all([
        fetch(`/api/dreams?${params.toString()}`),
        fetch(`/api/finance/month?month=${now.getMonth() + 1}&year=${now.getFullYear()}`),
      ]);

      if (dreamsRes.ok) {
        const data = await dreamsRes.json();
        setDreams(data.dreams || []);
      }

      if (financeRes.ok) {
        const fData = await financeRes.json();
        if (fData.monthData) {
          setSafeToSpend(fData.monthData.calculated?.safeToSpend || 0);
          setCurrency(fData.monthData.currency || 'INR');
        }
      }
    } catch (error) {
      console.error('Failed to fetch small dreams or finance data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, priorityFilter, categoryFilter, searchQuery, sortBy]);

  useEffect(() => {
    fetchDreamsAndFinance();
  }, [fetchDreamsAndFinance]);

  const handleSaveDream = async (data: Partial<DreamPurchaseItem>) => {
    if (editingDream) {
      await fetch(`/api/dreams/${editingDream.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } else {
      await fetch('/api/dreams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, type: 'SMALL_DREAM' }),
      });
    }
    await fetchDreamsAndFinance();
  };

  const handleDeleteDream = async (dreamId: string) => {
    if (!confirm('Are you sure you want to delete this Small Dream?')) return;
    await fetch(`/api/dreams/${dreamId}`, { method: 'DELETE' });
    if (selectedDream?.id === dreamId) setSelectedDream(null);
    await fetchDreamsAndFinance();
  };

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
      await fetchDreamsAndFinance();
    }
  };

  return (
    <AppShell onOpenAddDream={() => { setEditingDream(null); setIsAddModalOpen(true); }}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Compass className="w-6 h-6 text-purple-400" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Small Dreams
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Collectibles, Anime Figures, Manga Volumes, Audio Gear, Gaming & Accessories.
            </p>
          </div>

          {/* Right Action & Safe-To-Spend Indicator */}
          <div className="flex items-center gap-3">
            <Link
              href="/money"
              className="px-3.5 py-1.5 rounded-xl bg-[#121624] border border-emerald-500/30 text-xs flex items-center gap-2 hover:border-emerald-500/60 transition-all shadow-md"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Safe Limit:</span>
              <span className="font-mono font-bold text-emerald-300">
                {formatCurrency(safeToSpend, currency)}
              </span>
            </Link>

            <Button
              onClick={() => {
                setEditingDream(null);
                setIsAddModalOpen(true);
              }}
              variant="magic"
              size="md"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Small Dream
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl bg-[#121624]/90 border border-white/[0.08] shadow-lg space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-4">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search figures, manga, gear..."
                icon={<Search className="w-4 h-4 text-slate-400" />}
              />
            </div>

            <div className="sm:col-span-2">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full bg-[#0d101a]/90 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500/60"
              >
                <option value="ALL">All Priority Tiers</option>
                <option value="S_TIER">👑 S-Tier (Ultimate)</option>
                <option value="A_TIER">✨ A-Tier (Major)</option>
                <option value="B_TIER">🛡️ B-Tier (Important)</option>
                <option value="C_TIER">⭐ C-Tier (Nice to have)</option>
                <option value="D_TIER">📍 D-Tier (Someday)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#0d101a]/90 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500/60"
              >
                <option value="NOT_PURCHASED">Active (Unacquired)</option>
                <option value="ALL">All Statuses</option>
                <option value="READY_TO_BUY">⚡ Ready to Buy</option>
                <option value="SAVING">💰 Saving</option>
                <option value="DREAMING">✨ Dreaming</option>
                <option value="PURCHASED">🏆 Purchased</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-[#0d101a]/90 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500/60"
              >
                <option value="ALL">All Categories</option>
                {DREAM_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-[#0d101a]/90 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500/60"
              >
                <option value="recent">Recently Added</option>
                <option value="oldest">Oldest First</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="price_asc">Price: Low to High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Compact Grid with Affordability Chips */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-purple-400/40 border-t-purple-400 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400 font-mono">Gathering small treasures & checking safe limits...</p>
          </div>
        ) : dreams.length === 0 ? (
          <EmptyState
            type={searchQuery || priorityFilter !== 'ALL' ? 'FILTER' : 'SMALL_DREAM'}
            onAction={() => {
              if (searchQuery || priorityFilter !== 'ALL') {
                setSearchQuery('');
                setPriorityFilter('ALL');
                setStatusFilter('NOT_PURCHASED');
                setCategoryFilter('ALL');
              } else {
                setEditingDream(null);
                setIsAddModalOpen(true);
              }
            }}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {dreams.map((dream) => (
              <DreamCard
                key={dream.id}
                dream={dream}
                variant="small"
                safeToSpend={safeToSpend}
                currency={currency}
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

      {/* Modals */}
      <AddDreamModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingDream(null);
        }}
        onSave={handleSaveDream}
        initialData={editingDream}
        defaultType="SMALL_DREAM"
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
        onDreamUpdated={fetchDreamsAndFinance}
      />

      <PurchaseModal
        dream={purchasingDream}
        isOpen={Boolean(purchasingDream)}
        onClose={() => setPurchasingDream(null)}
        safeToSpend={safeToSpend}
        currency={currency}
        onConfirmPurchase={handleConfirmPurchase}
      />

      <CelebrationOverlay
        dream={celebratingDream}
        onClose={() => setCelebratingDream(null)}
      />
    </AppShell>
  );
}
