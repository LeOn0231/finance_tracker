'use client';

import React from 'react';
import { formatCurrency } from '@/lib/finance-calculator';
import { CheckCircle2, AlertTriangle, Coins, ShieldCheck } from 'lucide-react';

interface SmallDreamAffordabilityChipProps {
  price: number;
  safeToSpend: number;
  currency?: string;
  size?: 'sm' | 'md';
}

export const SmallDreamAffordabilityChip: React.FC<SmallDreamAffordabilityChipProps> = ({
  price,
  safeToSpend,
  currency = 'INR',
  size = 'md',
}) => {
  let status: 'SAFE_TO_BUY' | 'ABOVE_SAFE_SPEND' | 'SAVING_REQUIRED';
  let badgeColor: string;
  let statusLabel: string;
  const remaining = safeToSpend - price;

  if (safeToSpend <= 0) {
    status = 'SAVING_REQUIRED';
    badgeColor = 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-glow-gold';
    statusLabel = 'SAVING REQUIRED';
  } else if (price <= safeToSpend) {
    status = 'SAFE_TO_BUY';
    badgeColor = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-glow-emerald';
    statusLabel = 'SAFE TO BUY';
  } else {
    status = 'ABOVE_SAFE_SPEND';
    badgeColor = 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-glow-crimson';
    statusLabel = 'ABOVE SAFE-TO-SPEND';
  }

  if (size === 'sm') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeColor}`}
        title={
          status === 'SAFE_TO_BUY'
            ? `Guilt-free purchase (Remaining Safe-to-Spend: ${formatCurrency(remaining, currency)})`
            : status === 'SAVING_REQUIRED'
            ? 'Safe-to-spend is depleted. Additional savings required.'
            : `Exceeds current Safe-to-Spend by ${formatCurrency(Math.abs(remaining), currency)}`
        }
      >
        {status === 'SAFE_TO_BUY' ? (
          <>
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>SAFE TO BUY</span>
          </>
        ) : status === 'SAVING_REQUIRED' ? (
          <>
            <Coins className="w-3 h-3 text-amber-400" />
            <span>SAVING REQUIRED</span>
          </>
        ) : (
          <>
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>ABOVE SAFE-TO-SPEND</span>
          </>
        )}
      </span>
    );
  }

  return (
    <div
      className={`p-3 rounded-2xl border text-xs font-medium space-y-1 ${
        status === 'SAFE_TO_BUY'
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
          : status === 'SAVING_REQUIRED'
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
          : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
      }`}
    >
      <div className="flex items-center justify-between font-bold">
        <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          {status === 'SAFE_TO_BUY' ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          ) : status === 'SAVING_REQUIRED' ? (
            <Coins className="w-4 h-4 text-amber-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          )}
          {statusLabel}
        </span>
        <span className="font-mono">
          Safe Limit: {formatCurrency(safeToSpend, currency)}
        </span>
      </div>

      <p className="text-[11px] opacity-90">
        {status === 'SAFE_TO_BUY'
          ? `Guilt-free purchase. Remaining Safe-to-Spend: ${formatCurrency(remaining, currency)}`
          : status === 'SAVING_REQUIRED'
          ? 'Zero safe-to-spend available. Fulfill fixed expenses and savings targets first.'
          : `Requires ${formatCurrency(Math.abs(remaining), currency)} additional safe-to-spend.`}
      </p>
    </div>
  );
};
