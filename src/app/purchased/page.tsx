'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { DreamPurchaseItem, DREAM_CATEGORIES } from '@/lib/types';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { SafeImage } from '@/components/ui/safe-image';
import { DreamDetailModal } from '@/components/dreams/dream-detail-modal';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/finance-calculator';
import {
  Trophy,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  RotateCcw,
  ExternalLink,
  Layers,
  Award,
} from 'lucide-react';
import Link from 'next/link';

export default function PurchasedPage() {
  const [dreams, setDreams] = useState<DreamPurchaseItem[]>([]);
  const [currency, setCurrency] = useState<string>('INR');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedDream, setSelectedDream] = useState<DreamPurchaseItem | null>(null);

  const fetchPurchased = useCallback(async () => {
    try {
      setIsLoading(true);
      const now = new Date();
      const params = new URLSearchParams({
        status: 'PURCHASED',
        category: categoryFilter,
        search: searchQuery,
        sortBy: 'purchased_recent',
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
          setCurrency(fData.monthData.currency || 'INR');
        }
      }
    } catch (error) {
      console.error('Failed to load purchased history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter, searchQuery]);

  useEffect(() => {
    fetchPurchased();
  }, [fetchPurchased]);

  // Revert / Undo Purchase Action
  const handleRevertPurchase = async (dreamId: string) => {
    if (!confirm('Revert this dream back to active Saving status?')) return;
    try {
      const res = await fetch(`/api/dreams/${dreamId}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CANCEL_PURCHASE' }),
      });
      if (res.ok) {
        if (selectedDream?.id === dreamId) setSelectedDream(null);
        await fetchPurchased();
      }
    } catch (error) {
      console.error('Revert failed:', error);
    }
  };

  const totalSpent = dreams.reduce(
    (acc, item) => acc + (item.finalPrice || item.listedPrice || 0),
    0
  );

  const totalDays = dreams.reduce((acc, item) => {
    if (!item.datePurchased) return acc;
    const added = new Date(item.dateAdded).getTime();
    const bought = new Date(item.datePurchased).getTime();
    const diff = Math.max(0, Math.ceil((bought - added) / (1000 * 60 * 60 * 24)));
    return acc + diff;
  }, 0);
  const avgDays = dreams.length > 0 ? Math.round(totalDays / dreams.length) : 0;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#112328] via-[#101924] to-[#161c30] border border-teal-500/30 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-bold">
                <Trophy className="w-3.5 h-3.5 text-teal-400" />
                <span>Hall of Fame • Achieved Quests</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Purchased Quests
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Every milestone achieved and every dream materialized. Preserved for eternity in your Grimoire.
              </p>
            </div>

            {/* Metrics Chips */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="p-3.5 rounded-2xl bg-[#090e16]/80 border border-teal-500/30 text-right">
                <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block">
                  Total Acquired Value
                </span>
                <span className="text-xl sm:text-2xl font-black text-teal-300 font-mono">
                  {formatCurrency(totalSpent, currency)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#090e16]/80 border border-white/10 text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Avg Journey Time
                </span>
                <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                  {avgDays} {avgDays === 1 ? 'day' : 'days'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl bg-[#121624]/90 border border-white/[0.08] shadow-lg space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search acquired trophies..."
                icon={<Search className="w-4 h-4 text-slate-400" />}
              />
            </div>
            <div className="sm:col-span-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-[#0d101a]/90 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500/60"
              >
                <option value="ALL">All Categories</option>
                {DREAM_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* List of Purchased Items */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-teal-400/40 border-t-teal-400 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400 font-mono">Polishing the trophy vault...</p>
          </div>
        ) : dreams.length === 0 ? (
          <EmptyState
            type="PURCHASED"
            actionLabel="Browse Active Quests"
            onAction={() => {
              window.location.href = '/';
            }}
          />
        ) : (
          <div className="space-y-4">
            {dreams.map((dream) => {
              const boughtDate = dream.datePurchased ? new Date(dream.datePurchased) : new Date();
              const addedDate = new Date(dream.dateAdded);
              const diffDays = Math.max(
                0,
                Math.ceil((boughtDate.getTime() - addedDate.getTime()) / (1000 * 60 * 60 * 24))
              );

              return (
                <div
                  key={dream.id}
                  onClick={() => setSelectedDream(dream)}
                  className="group relative rounded-2xl bg-[#121626]/90 border border-teal-500/20 hover:border-teal-400/60 transition-all duration-300 p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-surface-elevated"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-teal-500/40 flex-shrink-0 relative shadow-glow-emerald">
                      <SafeImage
                        src={dream.image}
                        alt={dream.name}
                        category={dream.category}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <PriorityBadge priority={dream.priority} size="sm" />
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-400">
                          {dream.category}
                        </span>
                        {dream.brand && (
                          <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">
                            {dream.brand}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-teal-300 transition-colors truncate">
                        {dream.name}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1 text-teal-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Acquired: {boughtDate.toLocaleDateString()}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {diffDays} {diffDays === 1 ? 'day' : 'days'} from dream to reality
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5 gap-2">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        Final Acquisition
                      </span>
                      <span className="text-lg sm:text-xl font-black text-teal-300 font-mono">
                        {formatCurrency(dream.finalPrice || dream.listedPrice || 0, currency)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRevertPurchase(dream.id);
                        }}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 transition-colors flex items-center gap-1"
                        title="Revert to active dream status"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Revert
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <DreamDetailModal
        dream={selectedDream}
        isOpen={Boolean(selectedDream)}
        onClose={() => setSelectedDream(null)}
        onEdit={() => {}}
        onDelete={() => {}}
        onPurchaseClick={() => {}}
        onTogglePin={() => {}}
      />
    </AppShell>
  );
}
