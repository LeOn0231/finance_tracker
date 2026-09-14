'use client';

import React, { useState } from 'react';
import { DreamPurchaseItem } from '@/lib/types';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SafeImage } from '@/components/ui/safe-image';
import { Trophy, CheckCircle, Calendar, DollarSign, Sparkles } from 'lucide-react';

interface PurchaseModalProps {
  dream: DreamPurchaseItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmPurchase: (dreamId: string, finalPrice: number, purchaseDate: string, notes?: string) => Promise<void>;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  dream,
  isOpen,
  onClose,
  onConfirmPurchase,
}) => {
  const [finalPrice, setFinalPrice] = useState<string>(
    dream ? String(dream.finalPrice || dream.listedPrice || 0) : '0'
  );
  const [purchaseDate, setPurchaseDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when modal opens
  React.useEffect(() => {
    if (dream) {
      setFinalPrice(String(dream.finalPrice || dream.listedPrice || 0));
      setPurchaseDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [dream]);

  if (!dream) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(finalPrice) || dream.finalPrice || 0;
    setIsSubmitting(true);
    try {
      await onConfirmPurchase(dream.id, priceNum, purchaseDate, notes);
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
              Target: ${(dream.finalPrice || dream.listedPrice || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Inputs */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Actual Paid Price ($)
          </label>
          <Input
            type="number"
            step="any"
            value={finalPrice}
            onChange={(e) => setFinalPrice(e.target.value)}
            icon={<DollarSign className="w-4 h-4" />}
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
            icon={<Calendar className="w-4 h-4" />}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Victory Notes / Memory
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Bought during Black Friday sale, delivered today in mint condition!"
            rows={2}
            className="w-full bg-[#0d101a]/90 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
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
