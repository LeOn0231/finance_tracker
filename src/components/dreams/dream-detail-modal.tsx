'use client';

import React from 'react';
import { DreamPurchaseItem } from '@/lib/types';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { SafeImage } from '@/components/ui/safe-image';
import {
  ExternalLink,
  Edit,
  Trash2,
  Trophy,
  Flame,
  Calendar,
  DollarSign,
  Tag,
  Clock,
  Layers,
  CheckCircle2,
  Pin,
} from 'lucide-react';

interface DreamDetailModalProps {
  dream: DreamPurchaseItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (dream: DreamPurchaseItem) => void;
  onDelete?: (dreamId: string) => void;
  onPurchaseClick?: (dream: DreamPurchaseItem) => void;
  onTogglePin?: (dreamId: string) => void;
}

export const DreamDetailModal: React.FC<DreamDetailModalProps> = ({
  dream,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onPurchaseClick,
  onTogglePin,
}) => {
  if (!dream) return null;

  const finalPrice = dream.finalPrice || dream.listedPrice || 0;
  const listedPrice = dream.listedPrice || finalPrice;
  const amountSaved = dream.amountSaved || 0;
  const progressPercent = Math.min(100, Math.round((amountSaved / (finalPrice || 1)) * 100));
  const discount = listedPrice > finalPrice ? listedPrice - finalPrice : 0;

  // Compute days since dream was added
  const addedDate = new Date(dream.dateAdded);
  const diffTime = Math.abs(Date.now() - addedDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-3">
          <PriorityBadge priority={dream.priority} size="md" />
          <span className="text-sm font-semibold text-slate-400">Quest Dossier</span>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Hero Image & Headline */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
          <div className="sm:col-span-5 relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl aspect-[4/3] sm:aspect-square">
            <SafeImage
              src={dream.image}
              alt={dream.name}
              category={dream.category}
              className="w-full h-full object-cover"
            />
            {dream.isCurrentQuest && (
              <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-amber-500 text-black text-[11px] font-black flex items-center gap-1 shadow-lg">
                <Flame className="w-3.5 h-3.5 fill-black" />
                MAIN QUEST
              </div>
            )}
          </div>

          <div className="sm:col-span-7 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={dream.status} size="sm" />
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                {dream.type === 'BIG_DREAM' ? '👑 Big Dream' : '✨ Small Dream'}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                {dream.category}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
              {dream.name}
            </h2>

            {dream.brand && (
              <p className="text-xs font-bold text-amber-400/90 uppercase tracking-wider">
                Brand: <span className="text-slate-200">{dream.brand}</span>
              </p>
            )}

            {/* Price Box */}
            <div className="p-3.5 rounded-xl bg-[#0b0e18] border border-white/10 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Target Value:</span>
                <div className="flex items-baseline gap-2">
                  {discount > 0 && (
                    <span className="text-xs text-slate-500 line-through">
                      ${listedPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="text-xl font-extrabold text-amber-300 font-mono">
                    ${finalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between text-xs text-emerald-400 font-medium pt-1 border-t border-white/5">
                  <span>Price Advantage:</span>
                  <span>-${discount.toLocaleString()} savings</span>
                </div>
              )}

              {/* Progress Bar */}
              {dream.status !== 'PURCHASED' && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>Saved: ${amountSaved.toLocaleString()}</span>
                    <span>{progressPercent}% Funded</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Specifications Section */}
        {dream.specs && (
          <div className="p-4 rounded-xl bg-[#0e121f] border border-white/10">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Grimoire Specifications & Attributes
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
              {dream.specs}
            </p>
          </div>
        )}

        {/* Notes & Lore */}
        {dream.notes && (
          <div className="p-4 rounded-xl bg-[#0e121f] border border-white/10">
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Notes & Quest Log
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
              {dream.notes}
            </p>
          </div>
        )}

        {/* Metadata Footer Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-400 pt-2 border-t border-white/10">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Added: {addedDate.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Age: {diffDays} {diffDays === 1 ? 'day' : 'days'}</span>
          </div>
          {dream.datePurchased && (
            <div className="flex items-center gap-1.5 text-teal-400 col-span-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Acquired: {new Date(dream.datePurchased).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            {dream.sourceUrl && (
              <a
                href={dream.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                {dream.sourceName ? `View on ${dream.sourceName}` : 'View Source'}
              </a>
            )}
            {onTogglePin && (
              <button
                onClick={() => onTogglePin(dream.id)}
                className="p-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-amber-500/15 text-slate-300 hover:text-amber-300 border border-white/10 transition-colors"
                title={dream.isCurrentQuest ? 'Unpin Quest' : 'Set as Current Quest'}
              >
                <Pin className={`w-4 h-4 ${dream.isCurrentQuest ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(dream)}
                className="p-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
                title="Edit Dream"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(dream.id)}
                className="p-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-white/10 transition-colors"
                title="Delete Dream"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {dream.status !== 'PURCHASED' && onPurchaseClick && (
              <Button
                onClick={() => {
                  onClose();
                  onPurchaseClick(dream);
                }}
                variant="gold"
                size="md"
              >
                <Trophy className="w-4 h-4 mr-1.5" />
                I Bought This
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
