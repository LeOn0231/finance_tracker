'use client';

import React, { useState } from 'react';
import { DreamPurchaseItem, CONFIDENCE_CONFIG, PriceConfidence } from '@/lib/types';
import { formatCurrency } from '@/lib/finance-calculator';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { SafeImage } from '@/components/ui/safe-image';
import { PriceBreakdownCard } from '@/components/research/price-breakdown-card';
import { PriceHistoryChart } from '@/components/research/price-history-chart';
import { sounds } from '@/lib/sound';
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
  RefreshCw,
  MapPin,
  Edit3,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface DreamDetailModalProps {
  dream: DreamPurchaseItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (dream: DreamPurchaseItem) => void;
  onDelete?: (dreamId: string) => void;
  onPurchaseClick?: (dream: DreamPurchaseItem) => void;
  onTogglePin?: (dreamId: string) => void;
  onDreamUpdated?: (updatedDream: DreamPurchaseItem) => void;
}

export const DreamDetailModal: React.FC<DreamDetailModalProps> = ({
  dream: initialDream,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onPurchaseClick,
  onTogglePin,
  onDreamUpdated,
}) => {
  const [dream, setDream] = useState<DreamPurchaseItem | null>(initialDream);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshDelta, setRefreshDelta] = useState<{
    previousPrice: number;
    currentPrice: number;
    diff: number;
  } | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  // Keep local state in sync with prop changes
  React.useEffect(() => {
    setDream(initialDream);
    setRefreshDelta(null);
    setRefreshError(null);
  }, [initialDream, isOpen]);

  if (!dream) return null;

  const finalPrice = dream.finalPrice || dream.listedPrice || 0;
  const listedPrice = dream.listedPrice || finalPrice;
  const amountSaved = dream.amountSaved || 0;
  const progressPercent = Math.min(100, Math.round((amountSaved / (finalPrice || 1)) * 100));
  const discount = listedPrice > finalPrice ? listedPrice - finalPrice : 0;
  const currency = dream.currency || 'INR';

  // Price Confidence
  const confidence: PriceConfidence = (dream.priceConfidence as PriceConfidence) || 'VERIFIED';
  const confConfig = CONFIDENCE_CONFIG[confidence] || CONFIDENCE_CONFIG.VERIFIED;

  // Compute days since dream was added
  const addedDate = new Date(dream.dateAdded);
  const diffTime = Math.abs(Date.now() - addedDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Handle Refresh Price action
  const handleRefreshPrice = async () => {
    if (!dream) return;
    setIsRefreshing(true);
    setRefreshError(null);
    setRefreshDelta(null);
    sounds.playClick();

    try {
      const res = await fetch(`/api/dreams/${dream.id}/refresh-price`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to refresh price');
      }

      if (data.dream) {
        setDream(data.dream);
        if (onDreamUpdated) {
          onDreamUpdated(data.dream);
        }
        setRefreshDelta({
          previousPrice: data.previousPrice,
          currentPrice: data.currentPrice,
          diff: data.diff,
        });
        sounds.playTierUp();
      }
    } catch (err: unknown) {
      setRefreshError(err instanceof Error ? err.message : 'Market price check failed');
    } finally {
      setIsRefreshing(false);
    }
  };

  const locationText = dream.locationState
    ? `${dream.locationCity ? `${dream.locationCity}, ` : ''}${dream.locationState}`
    : undefined;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title={
        <div className="flex items-center gap-3">
          <PriorityBadge priority={dream.priority} size="md" />
          <span className="text-sm font-semibold text-slate-400">Quest Dossier</span>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Price Refresh Delta Notice */}
        {refreshDelta && (
          <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-between flex-wrap gap-2 text-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-bold text-white">Market Price Verified: </span>
                <span className="text-slate-300">
                  Previous {formatCurrency(refreshDelta.previousPrice, currency)} &rarr; Current{' '}
                  <strong className="text-amber-300 font-mono">
                    {formatCurrency(refreshDelta.currentPrice, currency)}
                  </strong>
                </span>
              </div>
            </div>

            <div
              className={`font-mono font-bold px-2.5 py-0.5 rounded-lg border ${
                refreshDelta.diff > 0
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : refreshDelta.diff < 0
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-500/20 text-slate-300 border-slate-500/40'
              }`}
            >
              {refreshDelta.diff > 0
                ? `+${formatCurrency(refreshDelta.diff, currency)}`
                : refreshDelta.diff < 0
                ? `-${formatCurrency(Math.abs(refreshDelta.diff), currency)}`
                : 'No change'}
            </div>
          </div>
        )}

        {refreshError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <span>{refreshError}</span>
            <button
              onClick={() => setRefreshError(null)}
              className="text-slate-400 hover:text-white text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Hero Image & Headline */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
          <div className="sm:col-span-5 relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl aspect-[4/3] sm:aspect-square bg-[#090c14]">
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
              {/* Confidence Badge */}
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border flex items-center gap-1 ${confConfig.badgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${confConfig.dotClass}`} />
                {confConfig.label}
              </span>
              {dream.isManualOverride && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1 font-semibold">
                  <Edit3 className="w-2.5 h-2.5" />
                  MANUAL
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
              {dream.name}
            </h2>

            <div className="flex items-center gap-3 text-xs flex-wrap">
              {dream.brand && (
                <p className="font-bold text-amber-400/90 uppercase tracking-wider">
                  Brand: <span className="text-slate-200">{dream.brand}</span>
                </p>
              )}
              {dream.variant && (
                <p className="text-slate-400">
                  Trim: <span className="text-purple-300 font-semibold">{dream.variant}</span>
                </p>
              )}
              {locationText && (
                <div className="inline-flex items-center gap-1 text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                  <MapPin className="w-3 h-3 text-purple-400" />
                  <span>{locationText}</span>
                </div>
              )}
            </div>

            {/* Price Box */}
            <div className="p-3.5 rounded-xl bg-[#0b0e18] border border-white/10 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400">
                  {dream.priceBreakdown ? 'Final On-Road Value:' : 'Target Value:'}
                </span>
                <div className="flex items-baseline gap-2">
                  {discount > 0 && (
                    <span className="text-xs text-slate-500 line-through">
                      {formatCurrency(listedPrice, currency)}
                    </span>
                  )}
                  <span className="text-xl font-extrabold text-amber-300 font-mono">
                    {formatCurrency(finalPrice, currency)}
                  </span>
                </div>
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between text-xs text-emerald-400 font-medium pt-1 border-t border-white/5">
                  <span>Price Advantage:</span>
                  <span>-{formatCurrency(discount, currency)} savings</span>
                </div>
              )}

              {/* Progress Bar */}
              {dream.status !== 'PURCHASED' && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>Saved: {formatCurrency(amountSaved, currency)}</span>
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

        {/* Price Breakdown Section (if vehicle or structured components exist) */}
        {dream.priceBreakdown && (
          <PriceBreakdownCard breakdown={dream.priceBreakdown} currency={currency} />
        )}

        {/* Price History Trajectory Chart */}
        <PriceHistoryChart
          history={dream.priceHistory}
          currentPrice={finalPrice}
          currency={currency}
        />

        {/* Specifications Section */}
        {dream.specs && (
          <div className="p-4 rounded-xl bg-[#0e121f] border border-white/10">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Grimoire Specifications & Attributes
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed font-mono">
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
          <div className="flex items-center gap-1.5 col-span-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Checked: {dream.checkedAt ? new Date(dream.checkedAt).toLocaleDateString() : 'Initial'}
            </span>
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
          <div className="flex items-center gap-2 flex-wrap">
            {dream.sourceUrl && (
              <a
                href={dream.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                {dream.sourceName ? `View on ${dream.sourceName}` : 'View Source'}
              </a>
            )}

            {/* Refresh Price Button */}
            <button
              type="button"
              onClick={handleRefreshPrice}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all"
              title="Researches current rates and updates price history"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Checking...' : 'Refresh Price'}
            </button>

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
