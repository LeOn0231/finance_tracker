'use client';

import React, { useState } from 'react';
import { DreamPurchaseItem, CONFIDENCE_CONFIG, PriceConfidence, PriceBreakdown } from '@/lib/types';
import { formatCurrency } from '@/lib/finance-calculator';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Truck,
  Receipt,
  Store,
  Sparkles,
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

  // Manual Override editing state
  const [isOverriding, setIsOverriding] = useState(false);
  const [overridePriceInput, setOverridePriceInput] = useState('');
  const [isSavingOverride, setIsSavingOverride] = useState(false);

  // Keep local state in sync with prop changes
  React.useEffect(() => {
    setDream(initialDream);
    setRefreshDelta(null);
    setRefreshError(null);
    setIsOverriding(false);
    if (initialDream) {
      setOverridePriceInput(String(initialDream.finalPrice || initialDream.listedPrice || 0));
    }
  }, [initialDream, isOpen]);

  if (!dream) return null;

  const finalPrice = dream.finalPrice || dream.listedPrice || 0;
  const listedPrice = dream.listedPrice || finalPrice;
  const shippingCost = dream.shippingCost || 0;
  const mandatoryFees = dream.mandatoryFees || 0;
  const amountSaved = dream.amountSaved || 0;
  const progressPercent = Math.min(100, Math.round((amountSaved / (finalPrice || 1)) * 100));
  const currency = dream.currency || 'INR';

  // Parse breakdown if available
  let parsedBreakdown: PriceBreakdown | null = null;
  if (dream.priceBreakdown) {
    if (typeof dream.priceBreakdown === 'string') {
      try {
        parsedBreakdown = JSON.parse(dream.priceBreakdown);
      } catch {
        parsedBreakdown = null;
      }
    } else {
      parsedBreakdown = dream.priceBreakdown;
    }
  }

  // Price Confidence
  const confidence: PriceConfidence = (dream.priceConfidence as PriceConfidence) || 'VERIFIED';
  const confConfig = CONFIDENCE_CONFIG[confidence] || CONFIDENCE_CONFIG.VERIFIED;

  // Source attribution display
  const verifiedSourceDisplay =
    dream.verifiedSource ||
    parsedBreakdown?.verifiedSource ||
    dream.sourceName ||
    (dream.sourceType === 'OFFICIAL'
      ? 'Official Brand Website'
      : dream.sourceType === 'AMAZON'
      ? 'Amazon India'
      : dream.sourceType === 'FLIPKART'
      ? 'Flipkart'
      : 'Verified Retailer');

  // Compute Checked Date display ("Today", "Yesterday", or formatted date)
  const formatCheckedDate = (dateVal?: string | Date | null) => {
    if (!dateVal) return 'Today';
    const d = new Date(dateVal);
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
    if (isToday) return 'Today';
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();
    if (isYesterday) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const checkedDisplay = formatCheckedDate(dream.lastChecked || dream.checkedAt);

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
        throw new Error(data.error || 'Failed to refresh price from trusted source.');
      }

      if (data.dream) {
        setDream(data.dream);
        setOverridePriceInput(String(data.dream.finalPrice));
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
      setRefreshError(err instanceof Error ? err.message : 'Market price verification failed');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle Manual Override Save
  const handleSaveManualOverride = async () => {
    if (!dream) return;
    const newPrice = parseFloat(overridePriceInput);
    if (isNaN(newPrice) || newPrice < 0) {
      setRefreshError('Please enter a valid price number.');
      return;
    }

    setIsSavingOverride(true);
    setRefreshError(null);
    sounds.playClick();

    try {
      const res = await fetch(`/api/dreams/${dream.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finalPrice: newPrice,
          finalCheckoutPrice: newPrice,
          manualOverride: true,
          isManualOverride: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save manual override.');
      }

      if (data.dream) {
        setDream(data.dream);
        setIsOverriding(false);
        if (onDreamUpdated) {
          onDreamUpdated(data.dream);
        }
        sounds.playChime();
      }
    } catch (err: unknown) {
      setRefreshError(err instanceof Error ? err.message : 'Failed to update price override');
    } finally {
      setIsSavingOverride(false);
    }
  };

  const isManual = Boolean(dream.manualOverride || dream.isManualOverride);

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
                <span className="font-bold text-white">Trusted Source Verified: </span>
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
                : 'No price change'}
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
              {isManual && (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1 font-bold tracking-wide">
                  <Edit3 className="w-2.5 h-2.5" />
                  Manually Edited
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
              {dream.model && (
                <p className="text-slate-400">
                  Model: <span className="text-slate-200 font-semibold">{dream.model}</span>
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

            {/* ------------------------------------------------------------------ */}
            {/* UNIVERSAL FINAL PRICE HERO BOX (REQUIRED SPECIFICATION) */}
            {/* ------------------------------------------------------------------ */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#0e1424] to-[#0a0d18] border border-amber-500/35 shadow-2xl space-y-3.5">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black tracking-widest text-amber-400 uppercase flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      FINAL PRICE
                    </span>
                    {isManual && (
                      <span className="text-[10px] px-2 py-0.2 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold">
                        Manually Edited
                      </span>
                    )}
                  </div>

                  {/* LARGEST NUMBER ON THE PAGE */}
                  <div className="text-3xl sm:text-4xl font-black text-amber-300 font-mono tracking-tight pt-0.5">
                    {formatCurrency(finalPrice, currency)}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsOverriding(!isOverriding)}
                    className="p-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-blue-500/20 text-slate-400 hover:text-blue-300 border border-white/10 transition-colors flex items-center gap-1"
                    title="Manually override final price"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Override</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRefreshPrice}
                    disabled={isRefreshing}
                    className="p-1.5 rounded-lg text-xs font-medium bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1"
                    title="Refresh current price from trusted source"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">{isRefreshing ? 'Checking...' : 'Refresh'}</span>
                  </button>
                </div>
              </div>

              {/* Manual Override Input Form */}
              {isOverriding && (
                <div className="p-3 rounded-xl bg-[#070a12] border border-blue-500/40 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs text-blue-300 font-semibold">
                    <span>Edit Final Amount (₹)</span>
                    <span className="text-[11px] text-slate-400">Original verified baseline preserved</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="any"
                      value={overridePriceInput}
                      onChange={(e) => setOverridePriceInput(e.target.value)}
                      placeholder="Enter custom final price..."
                      className="text-sm font-mono"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleSaveManualOverride}
                      isLoading={isSavingOverride}
                    >
                      Save
                    </Button>
                    <button
                      type="button"
                      onClick={() => setIsOverriding(false)}
                      className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* SPECIFICATION SUB-BREAKDOWN BOX */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-white/10 text-xs font-mono">
                <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-sans uppercase">Listed:</span>
                  <div className="font-bold text-slate-200">
                    {formatCurrency(listedPrice, currency)}
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-sans uppercase">Shipping:</span>
                  <div className="font-bold text-slate-200">
                    {shippingCost > 0 ? formatCurrency(shippingCost, currency) : '₹0 (Free)'}
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-sans uppercase">Fees:</span>
                  <div className="font-bold text-slate-200">
                    {mandatoryFees > 0 ? formatCurrency(mandatoryFees, currency) : '₹0'}
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5 col-span-2 sm:col-span-2">
                  <span className="text-[10px] text-slate-400 font-sans uppercase flex items-center gap-1">
                    <Store className="w-3 h-3 text-amber-400" />
                    Source:
                  </span>
                  <div className="font-bold text-amber-300 font-sans truncate" title={verifiedSourceDisplay}>
                    {verifiedSourceDisplay}
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-sans uppercase flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Checked:
                  </span>
                  <div className="font-bold text-slate-200 font-sans">
                    {checkedDisplay}
                  </div>
                </div>
              </div>

              {/* Savings Progress Bar */}
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

        {/* Detailed Itemized / Vehicle Cost Breakdown Section */}
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
              Source Verified: {verifiedSourceDisplay} ({checkedDisplay})
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
            {dream.officialUrl && (
              <a
                href={dream.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Official Brand Site
              </a>
            )}

            {dream.marketplaceUrl && (
              <a
                href={dream.marketplaceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                Marketplace Listing
              </a>
            )}

            {dream.sourceUrl && !dream.officialUrl && !dream.marketplaceUrl && (
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
              title="Re-fetches current price from trusted source and logs trajectory"
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
