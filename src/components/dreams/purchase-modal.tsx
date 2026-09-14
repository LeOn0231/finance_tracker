'use client';

import React, { useState, useEffect } from 'react';
import { DreamPurchaseItem } from '@/lib/types';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SafeImage } from '@/components/ui/safe-image';
import { formatCurrency, evaluateAffordability } from '@/lib/finance-calculator';
import { Trophy, CheckCircle, Calendar, DollarSign, Sparkles, ShieldCheck, AlertTriangle } from 'lucide-react';

interface PurchaseModalProps {
  dream: DreamPurchaseItem | null;
  isOpen: boolean;
  onClose: () => void;
  safeToSpend?: number;
  currency?: string;
  onConfirmPurchase: (
    dreamId: string,
    finalPrice: number,
    purchaseDate: string,
    notes?: string,
    recordInSpending?: boolean
  ) => Promise<void>;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  dream,
  isOpen,
  onClose,
  safeToSpend = 0,
  currency = 'INR',
  onConfirmPurchase,
}) => {
  const [finalPrice, setFinalPrice] = useState<string>(
    dream ? String(dream.finalPrice || dream.listedPrice || 0) : '0'
  );
  const [purchaseDate, setPurchaseDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [recordInSpending, setRecordInSpending] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (dream) {
      setFinalPrice(String(dream.finalPrice || dream.listedPrice || 0));
      setPurchaseDate(new Date().toISOString().split('T')[0]);
      setRecordInSpending(true);
      setNotes('');
    }
  }, [dream]);

  if (!dream) return null;

  const parsedPrice = parseFloat(finalPrice) || dream.finalPrice || 0;
  const assessment = evaluateAffordability(parsedPrice, safeToSpend);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirmPurchase(dream.id, parsedPrice, purchaseDate, notes, recordInSpending);
      onClose();
    } catch (error) {
      console.error('Purchase confirmation failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span>Confirm Quest Acquisition</span>
        </div>
      }
      subtitle="Verify your dream acquisition details before recording in the Hall of Fame."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Item Preview Card */}
        <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#0d101a] border border-white/10">
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
            <SafeImage
              src={dream.image}
              alt={dream.name}
              category={dream.category}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-white truncate">{dream.name}</h4>
            <p className="text-xs text-slate-400">{dream.brand || dream.category}</p>
            <p className="text-xs font-mono text-amber-400 font-semibold mt-0.5">
              Target: {formatCurrency(dream.finalPrice || dream.listedPrice || 0, currency)}
            </p>
          </div>
        </div>

        {/* Real-time Safe-to-Spend Comparison Box */}
        <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
          assessment.isAffordable
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
        }`}>
          <div className="flex justify-between items-center font-bold">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              {assessment.isAffordable ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
              {assessment.statusText}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/10 font-mono text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Safe Limit</span>
              <span className="font-bold text-slate-200">{formatCurrency(safeToSpend, currency)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Purchase</span>
              <span className="font-bold text-amber-300">{formatCurrency(parsedPrice, currency)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Remaining</span>
              <span className={`font-bold ${assessment.isAffordable ? 'text-emerald-300' : 'text-rose-400'}`}>
                {formatCurrency(assessment.remainingAfterPurchase, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Actual Paid Price ({currency})
            </label>
            <Input
              type="number"
              step="any"
              value={finalPrice}
              onChange={(e) => setFinalPrice(e.target.value)}
              placeholder="0"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Purchase Date
            </label>
            <Input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Deduct from Monthly Spending Checkbox */}
        <div className="p-3.5 rounded-xl bg-[#0b0e18] border border-white/10">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={recordInSpending}
              onChange={(e) => setRecordInSpending(e.target.checked)}
              className="mt-0.5 rounded border-white/20 bg-slate-800 text-amber-500 focus:ring-0"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-200 block">Record in this month&apos;s spending ledger</span>
              <span className="text-slate-400 text-[11px] leading-relaxed">
                Automatically deducts this acquisition from your active Safe-to-Spend cash flow.
              </span>
            </div>
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Victory Notes / Memory
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Bought with discount coupon, delivered in mint condition!"
            rows={2}
            className="w-full bg-[#0d101a]/90 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        <div className="pt-2 flex gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gold"
            isLoading={isSubmitting}
            className="flex-1"
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            I Bought This!
          </Button>
        </div>
      </form>
    </Modal>
  );
};
