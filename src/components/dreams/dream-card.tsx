'use client';

import React from 'react';
import { DreamPurchaseItem, PRIORITY_TIERS, CONFIDENCE_CONFIG, PriceConfidence } from '@/lib/types';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { SafeImage } from '@/components/ui/safe-image';
import { SmallDreamAffordabilityChip } from '@/components/finance/small-dream-affordability-chip';
import { formatCurrency } from '@/lib/finance-calculator';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  Flame,
  ExternalLink,
  Edit,
  Trash2,
  Calendar,
  Pin,
  CheckCircle2,
  Layers,
  Clock,
  MapPin,
  ShieldCheck,
  Edit3,
} from 'lucide-react';

interface DreamCardProps {
  dream: DreamPurchaseItem;
  variant?: 'big' | 'small' | 'list';
  safeToSpend?: number;
  currency?: string;
  onSelect: (dream: DreamPurchaseItem) => void;
  onEdit: (dream: DreamPurchaseItem) => void;
  onDelete: (dreamId: string) => void;
  onPurchaseClick: (dream: DreamPurchaseItem) => void;
  onTogglePin?: (dreamId: string) => void;
}

export const DreamCard: React.FC<DreamCardProps> = ({
  dream,
  variant = 'big',
  safeToSpend,
  currency = 'INR',
  onSelect,
  onEdit,
  onDelete,
  onPurchaseClick,
  onTogglePin,
}) => {
  const finalPrice = dream.finalPrice || dream.listedPrice || 0;
  const amountSaved = dream.amountSaved || 0;
  const progressPercent = Math.min(100, Math.round((amountSaved / (finalPrice || 1)) * 100));
  const isPurchased = dream.status === 'PURCHASED';

  const tierKey = dream.priority in PRIORITY_TIERS ? dream.priority : 'A_TIER';
  const tierInfo = PRIORITY_TIERS[tierKey];

  const addedDate = new Date(dream.dateAdded).toLocaleDateString();
  const confidence: PriceConfidence = (dream.priceConfidence as PriceConfidence) || 'VERIFIED';
  const confConfig = CONFIDENCE_CONFIG[confidence] || CONFIDENCE_CONFIG.VERIFIED;

  const isVehicle = dream.category === 'Vehicles' || Boolean(dream.priceBreakdown);
  const locationText = dream.locationState
    ? `${dream.locationCity ? `${dream.locationCity}, ` : ''}${dream.locationState}`
    : undefined;

  // 1. SMALL COMPACT CARD VARIANT
  if (variant === 'small') {
    return (
      <div
        onClick={() => onSelect(dream)}
        className={`group relative rounded-2xl bg-[#121624]/90 border border-white/[0.08] hover:border-amber-400/40 transition-all duration-300 hover:shadow-card-hover overflow-hidden cursor-pointer flex flex-col ${
          dream.isCurrentQuest ? 'ring-2 ring-amber-400/60 shadow-glow-gold' : ''
        }`}
      >
        {/* Top Image Container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0c0f18]">
          <SafeImage
            src={dream.image}
            alt={dream.name}
            category={dream.category}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121624] via-transparent to-black/30" />

          {/* Badges on Image */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            <PriorityBadge priority={dream.priority} size="sm" />
          </div>

          <div className="absolute top-2 right-2 flex items-center gap-1">
            <StatusBadge status={dream.status} size="sm" />
          </div>

          {dream.isCurrentQuest && (
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-amber-500 text-black text-[10px] font-black flex items-center gap-1 shadow-md">
              <Flame className="w-3 h-3 fill-black" />
              FOCUS
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="truncate font-medium">{dream.brand || dream.category}</span>
              <span className="font-mono text-slate-500">{addedDate}</span>
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
              {dream.name}
            </h4>
          </div>

          {/* Price & Affordability */}
          <div className="pt-1 border-t border-white/5 space-y-1.5">
            <div className="flex items-baseline justify-between">
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-400">{isVehicle ? 'On-Road' : 'Target'}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full border ${confConfig.badgeClass}`}>
                  {confConfig.label.charAt(0)}
                </span>
              </div>
              <span className="text-base font-extrabold text-amber-300 font-mono">
                {formatCurrency(finalPrice, currency)}
              </span>
            </div>

            {/* Affordability Badge for Small Dreams */}
            {!isPurchased && safeToSpend !== undefined && (
              <div className="pt-0.5">
                <SmallDreamAffordabilityChip
                  price={finalPrice}
                  safeToSpend={safeToSpend}
                  currency={currency}
                  size="sm"
                />
              </div>
            )}

            {!isPurchased && safeToSpend === undefined && (
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
          </div>

          {/* Bottom Quick Actions */}
          <div className="pt-2 flex items-center justify-between gap-1.5 border-t border-white/5">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(dream);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Edit"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(dream.id);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {!isPurchased ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPurchaseClick(dream);
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-black font-semibold text-xs border border-amber-500/30 transition-all flex items-center gap-1 shadow-sm"
              >
                <Trophy className="w-3 h-3" />
                Buy
              </button>
            ) : (
              <span className="text-[11px] text-teal-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Acquired
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. BIG FEATURED CARD VARIANT (Default)
  return (
    <div
      onClick={() => onSelect(dream)}
      className={`group relative rounded-3xl bg-[#121626]/90 border border-white/[0.08] hover:border-amber-400/50 transition-all duration-300 hover:shadow-card-hover overflow-hidden cursor-pointer flex flex-col ${
        dream.isCurrentQuest ? 'quest-aura-active border-amber-500/60' : ''
      }`}
    >
      {/* Top Media Banner */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#0a0d16]">
        <SafeImage
          src={dream.image}
          alt={dream.name}
          category={dream.category}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121626] via-[#121626]/30 to-black/40" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
          <PriorityBadge priority={dream.priority} size="md" showSublabel />
        </div>

        <div className="absolute top-3.5 right-3.5 flex items-center gap-2">
          <StatusBadge status={dream.status} size="md" />
        </div>

        {/* Current Quest Badge */}
        {dream.isCurrentQuest && (
          <div className="absolute bottom-3 left-3.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-xs font-black flex items-center gap-1.5 shadow-glow-gold animate-pulse">
            <Flame className="w-4 h-4 fill-black" />
            ACTIVE MAIN QUEST
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 flex-wrap gap-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-amber-400/90 tracking-wider uppercase">
                {dream.brand || dream.category}
              </span>
              <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold border flex items-center gap-1 ${confConfig.badgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${confConfig.dotClass}`} />
                {confConfig.label}
              </span>
              {dream.isManualOverride && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  MANUAL
                </span>
              )}
            </div>

            <span className="font-mono text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {addedDate}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
            {dream.name}
          </h3>

          {locationText && (
            <div className="flex items-center gap-1 text-[11px] text-purple-300">
              <MapPin className="w-3 h-3 text-purple-400" />
              <span>{locationText}</span>
            </div>
          )}

          {dream.specs && (
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {dream.specs}
            </p>
          )}
        </div>

        {/* Financial Progress Box (Big Dream Finance) */}
        <div className="p-4 rounded-2xl bg-[#0a0d16]/80 border border-white/5 space-y-2.5">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-medium text-slate-400">
              {isVehicle ? 'On-Road Target Goal' : 'Target Goal'}
            </span>
            <div className="flex items-baseline gap-2">
              {dream.listedPrice > finalPrice && (
                <span className="text-xs text-slate-500 line-through">
                  {formatCurrency(dream.listedPrice, currency)}
                </span>
              )}
              <span className="text-xl font-extrabold text-amber-300 font-mono tracking-tight">
                {formatCurrency(finalPrice, currency)}
              </span>
            </div>
          </div>

          {!isPurchased && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Funded: {formatCurrency(amountSaved, currency)}</span>
                <span>{progressPercent}% Complete</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-0.5">
                <span>Remaining: {formatCurrency(Math.max(0, finalPrice - amountSaved), currency)}</span>
                {dream.monthlyContribution ? (
                  <span className="text-purple-300 font-medium">
                    +{formatCurrency(dream.monthlyContribution, currency)}/mo allocation
                  </span>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between gap-3 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            {onTogglePin && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin(dream.id);
                }}
                className={`p-2 rounded-xl text-xs font-medium border transition-colors ${
                  dream.isCurrentQuest
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-white/5 text-slate-400 hover:text-white border-white/10 hover:bg-white/10'
                }`}
                title={dream.isCurrentQuest ? 'Unpin Quest' : 'Set as Current Quest'}
              >
                <Pin className={`w-4 h-4 ${dream.isCurrentQuest ? 'fill-amber-400' : ''}`} />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(dream);
              }}
              className="p-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
              title="Edit Quest"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(dream.id);
              }}
              className="p-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 transition-colors"
              title="Delete Quest"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div>
            {!isPurchased ? (
              <Button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPurchaseClick(dream);
                }}
                variant="gold"
                size="sm"
              >
                <Trophy className="w-3.5 h-3.5 mr-1" />
                I Bought This
              </Button>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/15 text-teal-300 border border-teal-500/30 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-teal-300" />
                Quest Complete
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
