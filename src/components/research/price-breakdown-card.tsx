'use client';

import React from 'react';
import { PriceBreakdown } from '@/lib/types';
import { formatCurrency } from '@/lib/finance-calculator';
import { ShieldCheck, MapPin, Calculator, Store, Truck, Info } from 'lucide-react';

interface PriceBreakdownCardProps {
  breakdown: PriceBreakdown | string | null | undefined;
  currency?: string;
  className?: string;
  compact?: boolean;
}

export const PriceBreakdownCard: React.FC<PriceBreakdownCardProps> = ({
  breakdown: rawBreakdown,
  currency = 'INR',
  className = '',
  compact = false,
}) => {
  if (!rawBreakdown) return null;

  let breakdown: PriceBreakdown;
  if (typeof rawBreakdown === 'string') {
    try {
      breakdown = JSON.parse(rawBreakdown);
    } catch {
      return null;
    }
  } else {
    breakdown = rawBreakdown;
  }

  if (!breakdown.components || breakdown.components.length === 0) {
    return null;
  }

  const isVehicle = breakdown.type === 'VEHICLE_ON_ROAD';
  const isElectronics = breakdown.type === 'ELECTRONICS';
  const isApparel = breakdown.type === 'APPAREL';

  const titleText = isVehicle
    ? 'On-Road Price Breakdown'
    : isElectronics
    ? 'Electronics & Peripheral Cost Breakdown'
    : isApparel
    ? 'Apparel & Footwear Payable Breakdown'
    : 'Itemized Cost Breakdown';

  const subtitleText = isVehicle
    ? 'Statutory state RTO registration, comprehensive insurance & road safety charges'
    : isElectronics
    ? 'Verified selling price, insured delivery & mandatory platform handling charges'
    : isApparel
    ? 'Payable checkout total with doorstep delivery fee calculation'
    : 'Verified retail components to calculate exact total amount required to own';

  const locationText = breakdown.location
    ? `${breakdown.location.city ? `${breakdown.location.city}, ` : ''}${breakdown.location.state}`
    : undefined;

  return (
    <div
      className={`rounded-2xl bg-[#0c101c] border border-amber-500/25 p-4 sm:p-5 shadow-xl space-y-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              {titleText}
            </h4>
            <p className="text-[11px] text-slate-400">
              {subtitleText}
            </p>
          </div>
        </div>

        {locationText && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5 text-purple-400" />
            <span>{locationText}</span>
          </div>
        )}
      </div>

      {/* Components Table */}
      <div className="space-y-2">
        {breakdown.components.map((comp, idx) => {
          const isBase = idx === 0;
          return (
            <div
              key={idx}
              className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors ${
                isBase
                  ? 'bg-amber-500/10 border border-amber-500/20 text-slate-100 font-semibold'
                  : 'bg-white/[0.02] hover:bg-white/[0.04] text-slate-300 border border-white/5'
              }`}
            >
              <div className="space-y-0.5 max-w-[70%]">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-slate-200">{comp.name}</span>
                  {!comp.isMandatory && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      Optional
                    </span>
                  )}
                </div>
                {comp.description && !compact && (
                  <p className="text-[10px] text-slate-400 line-clamp-1">{comp.description}</p>
                )}
              </div>
              <span className="font-mono font-bold text-slate-100 text-sm">
                {formatCurrency(comp.amount, currency || breakdown.currency)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Final Price Total Reconciliation */}
      <div className="pt-3 border-t border-white/10 flex items-baseline justify-between">
        <div className="space-y-0.5">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            {isVehicle ? 'Final On-Road Price' : 'Final Price to Own'}
          </span>
          <p className="text-[10px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Exact reconciliation total
          </p>
        </div>
        <div className="text-right">
          <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono tracking-tight">
            {formatCurrency(breakdown.finalPrice, currency || breakdown.currency)}
          </span>
        </div>
      </div>
    </div>
  );
};
