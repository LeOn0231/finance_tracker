'use client';

import React, { useState } from 'react';
import { SavingsAllocationItem, DreamPurchaseItem } from '@/lib/types';
import { formatCurrency } from '@/lib/finance-calculator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Plus, Trash2, PiggyBank, Target, Crown, Sparkles, Layers } from 'lucide-react';

interface SavingsAllocatorProps {
  financialMonthId: string;
  savingsTarget: number;
  allocations: SavingsAllocationItem[];
  bigDreams: DreamPurchaseItem[];
  currency?: string;
  onUpdateTarget: (newTarget: number) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const SavingsAllocator: React.FC<SavingsAllocatorProps> = ({
  financialMonthId,
  savingsTarget,
  allocations,
  bigDreams,
  currency = 'INR',
  onUpdateTarget,
  onRefresh,
}) => {
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [isAllocModalOpen, setIsAllocModalOpen] = useState(false);

  const [targetInput, setTargetInput] = useState(String(savingsTarget));
  const [allocTitle, setAllocTitle] = useState('');
  const [allocAmount, setAllocAmount] = useState('');
  const [allocDreamId, setAllocDreamId] = useState('');
  const [allocNotes, setAllocNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAllocated = allocations.reduce((acc, item) => acc + item.amount, 0);
  const unallocated = Math.max(0, savingsTarget - totalAllocated);

  const handleOpenAlloc = (presetDream?: DreamPurchaseItem) => {
    if (presetDream) {
      setAllocTitle(`${presetDream.name} Fund`);
      setAllocDreamId(presetDream.id);
      setAllocAmount(String(presetDream.monthlyContribution || Math.min(unallocated || 500, 500)));
    } else {
      setAllocTitle('');
      setAllocDreamId('');
      setAllocAmount(String(unallocated > 0 ? unallocated : ''));
    }
    setAllocNotes('');
    setIsAllocModalOpen(true);
  };

  const handleSaveTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(targetInput);
    if (isNaN(val) || val < 0) return;

    setIsSubmitting(true);
    try {
      await onUpdateTarget(val);
      setIsTargetModalOpen(false);
    } catch (error) {
      console.error('Update savings target failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(allocAmount);
    if (isNaN(amt) || amt <= 0) return;

    setIsSubmitting(true);
    try {
      await fetch('/api/finance/allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          financialMonthId,
          title: allocTitle.trim(),
          amount: amt,
          linkedDreamId: allocDreamId || null,
          notes: allocNotes.trim() || null,
        }),
      });
      setIsAllocModalOpen(false);
      await onRefresh();
    } catch (error) {
      console.error('Save allocation failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAllocation = async (id: string) => {
    if (!confirm('Delete this savings allocation?')) return;
    try {
      await fetch(`/api/finance/allocations?id=${id}`, { method: 'DELETE' });
      await onRefresh();
    } catch (error) {
      console.error('Delete allocation failed:', error);
    }
  };

  return (
    <div className="rounded-3xl bg-[#121624]/90 border border-white/[0.08] p-5 sm:p-6 shadow-xl space-y-5">
      {/* Header with Monthly Savings Goal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-purple-400" />
            <span>Savings Target & Goal Allocation</span>
          </h3>
          <p className="text-xs text-slate-400">
            Dedicated capital allocated to Big Dreams, emergency reserves, and long-term funds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setTargetInput(String(savingsTarget));
              setIsTargetModalOpen(true);
            }}
            variant="secondary"
            size="sm"
          >
            Adjust Target
          </Button>
          <Button onClick={() => handleOpenAlloc()} variant="magic" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Allocate Fund
          </Button>
        </div>
      </div>

      {/* Target vs Allocated Visual Bar */}
      <div className="p-4 rounded-2xl bg-[#0b0e18] border border-white/5 space-y-2">
        <div className="flex justify-between items-baseline text-xs">
          <span className="text-slate-400">
            Monthly Target: <strong className="text-purple-300 font-mono text-sm">{formatCurrency(savingsTarget, currency)}</strong>
          </span>
          <span className="text-slate-400">
            Allocated: <strong className="text-emerald-300 font-mono text-sm">{formatCurrency(totalAllocated, currency)}</strong>
            {unallocated > 0 && (
              <span className="text-amber-400/90 ml-2">({formatCurrency(unallocated, currency)} unpartitioned)</span>
            )}
          </span>
        </div>

        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-emerald-400 rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, savingsTarget > 0 ? Math.round((totalAllocated / savingsTarget) * 100) : 0)}%`,
            }}
          />
        </div>
      </div>

      {/* Active Allocations List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Allocated Sub-Funds
        </h4>

        {allocations.length === 0 ? (
          <div className="p-5 rounded-2xl bg-[#0a0d16] border border-white/5 text-center text-xs text-slate-400">
            No partitioned funds assigned yet. Allocate your savings toward specific Big Dreams or emergency buffers.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allocations.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-[#0e121f] border border-white/10 hover:border-purple-500/40 transition-all flex items-start justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h5 className="text-sm font-bold text-white truncate">{item.title}</h5>
                    {item.linkedDream && (
                      <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    )}
                  </div>

                  <div className="text-lg font-black text-purple-300 font-mono">
                    {formatCurrency(item.amount, currency)}
                  </div>

                  {item.linkedDream && (
                    <div className="text-[11px] text-amber-300/80 truncate">
                      Linked: {item.linkedDream.name} (Saved: {formatCurrency(item.linkedDream.amountSaved, currency)} / {formatCurrency(item.linkedDream.finalPrice, currency)})
                    </div>
                  )}

                  {item.notes && (
                    <p className="text-[11px] text-slate-400 italic truncate">{item.notes}</p>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteAllocation(item.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Remove Allocation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Allocate To Big Dreams Suggestions */}
      {bigDreams.length > 0 && (
        <div className="pt-2 border-t border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5" />
              Quick Allocate to Active Big Dreams:
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {bigDreams.slice(0, 4).map((dream) => (
              <button
                key={dream.id}
                type="button"
                onClick={() => handleOpenAlloc(dream)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-amber-500/15 text-slate-300 hover:text-amber-300 border border-white/10 hover:border-amber-500/40 text-xs font-medium transition-all flex items-center gap-1.5"
              >
                <span>{dream.name}</span>
                <span className="text-[10px] text-amber-400 font-mono">
                  +Fund
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Adjust Target Modal */}
      <Modal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        title="Set Monthly Savings Target"
        maxWidth="sm"
      >
        <form onSubmit={handleSaveTarget} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Target Savings Goal ({currency})
            </label>
            <Input
              type="number"
              step="any"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              placeholder="e.g. 20000"
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsTargetModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gold" isLoading={isSubmitting}>
              Update Target
            </Button>
          </div>
        </form>
      </Modal>

      {/* Allocate Fund Modal */}
      <Modal
        isOpen={isAllocModalOpen}
        onClose={() => setIsAllocModalOpen(false)}
        title="Allocate Monthly Savings to Fund"
        maxWidth="md"
      >
        <form onSubmit={handleSaveAllocation} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Fund Name / Goal *
            </label>
            <Input
              value={allocTitle}
              onChange={(e) => setAllocTitle(e.target.value)}
              placeholder="e.g. Royal Enfield Meteor Fund, Emergency Buffer"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Amount ({currency}) *
              </label>
              <Input
                type="number"
                step="any"
                value={allocAmount}
                onChange={(e) => setAllocAmount(e.target.value)}
                placeholder="0"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Link to Big Dream
              </label>
              <select
                value={allocDreamId}
                onChange={(e) => {
                  setAllocDreamId(e.target.value);
                  const selected = bigDreams.find((d) => d.id === e.target.value);
                  if (selected && !allocTitle) {
                    setAllocTitle(`${selected.name} Fund`);
                  }
                }}
                className="w-full bg-[#0d101a]/90 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500/60"
              >
                <option value="">None (General Fund)</option>
                {bigDreams.map((d) => (
                  <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Notes
            </label>
            <Input
              value={allocNotes}
              onChange={(e) => setAllocNotes(e.target.value)}
              placeholder="e.g. Auto-allocated from salary bonus"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsAllocModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="magic" isLoading={isSubmitting}>
              Inscribe Allocation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
