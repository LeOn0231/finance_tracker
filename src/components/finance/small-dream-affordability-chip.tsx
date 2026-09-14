'use client';

import React from 'react';
import { evaluateAffordability, formatCurrency } from '@/lib/finance-calculator';
import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

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
  const assessment = evaluateAffordability(price, safeToSpend);

  if (size === 'sm') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${assessment.badgeColor}`}
        title={
          assessment.isAffordable
            ? `Safe to buy this month (Remaining Safe-to-Spend: ${formatCurrency(assessment.remainingAfterPurchase, currency)})`
            : `Exceeds current Safe-to-Spend by ${formatCurrency(assessment.shortfall, currency)}`
        }
      >
        {assessment.isAffordable ? (
          <>
            <CheckCircle2 className="w-3 h-3 text-emerald-300" />
            <span>AFFORDABLE</span>
          </>
        ) : (
          <>
            <AlertTriangle className="w-3 h-3 text-rose-300" />
            <span>ABOVE SAFE LIMIT</span>
          </>
        )}
      </span>
    );
  }

  return (
    <div
      className={`p-3 rounded-2xl border text-xs font-medium space-y-1 ${
        assessment.isAffordable
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
          : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
      }`}
    >
      <div className="flex items-center justify-between font-bold">
        <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          {assessment.isAffordable ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          )}
          {assessment.statusText}
        </span>
        <span className="font-mono">
          Safe Limit: {formatCurrency(safeToSpend, currency)}
        </span>
      </div>

      <p className="text-[11px] opacity-90">
        {assessment.isAffordable
          ? `Remaining Safe-to-Spend after this purchase: ${formatCurrency(assessment.remainingAfterPurchase, currency)}`
          : `Requires ${formatCurrency(assessment.shortfall, currency)} additional available funds.`}
      </p>
    </div>
  );
};
