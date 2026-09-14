'use client';

import React from 'react';
import { PriceHistoryItem, CONFIDENCE_CONFIG } from '@/lib/types';
import { formatCurrency } from '@/lib/finance-calculator';
import { TrendingUp, TrendingDown, Clock, ShieldCheck, HelpCircle, AlertCircle } from 'lucide-react';

interface PriceHistoryChartProps {
  history: PriceHistoryItem[] | undefined;
  currentPrice: number;
  currency?: string;
  className?: string;
}

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  history = [],
  currentPrice,
  currency = 'INR',
  className = '',
}) => {
  // Sort oldest to newest for visual trajectory
  const points = [...history].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  // If no historical points, show initial current price snapshot
  if (points.length === 0) {
    return (
      <div className={`p-4 rounded-2xl bg-[#0c101c] border border-white/10 text-center space-y-2 ${className}`}>
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Price Trajectory</span>
        </div>
        <p className="text-xs text-slate-400">
          Initial target price logged at <span className="font-mono text-amber-300 font-bold">{formatCurrency(currentPrice, currency)}</span>. Click <span className="text-amber-400 font-semibold">Refresh Price</span> anytime to track market price movements.
        </p>
      </div>
    );
  }

  // Calculate min, max, and net delta
  const prices = points.map((p) => p.price);
  if (currentPrice) prices.push(currentPrice);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const initialPrice = points[0]?.price || currentPrice;
  const netDiff = currentPrice - initialPrice;
  const pctChange = initialPrice > 0 ? ((netDiff / initialPrice) * 100).toFixed(1) : '0';

  // SVG dimensions
  const svgWidth = 500;
  const svgHeight = 120;
  const paddingX = 40;
  const paddingY = 20;

  const range = maxPrice - minPrice || 1;
  const getX = (idx: number, total: number) =>
    paddingX + (idx / Math.max(1, total - 1)) * (svgWidth - paddingX * 2);
  const getY = (price: number) =>
    svgHeight - paddingY - ((price - minPrice) / range) * (svgHeight - paddingY * 2);

  // Combine points with current price if latest is not already there
  const allPoints = [...points];
  const lastPoint = allPoints[allPoints.length - 1];
  if (lastPoint && lastPoint.price !== currentPrice) {
    allPoints.push({
      id: 'current',
      dreamId: lastPoint.dreamId,
      price: currentPrice,
      currency,
      confidence: 'VERIFIED',
      priceType: 'FINAL',
      recordedAt: new Date().toISOString(),
      notes: 'Current market rate',
    });
  }

  const pathData = allPoints
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx, allPoints.length)} ${getY(p.price)}`)
    .join(' ');

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-[#0b0e1a] border border-white/10 space-y-4 shadow-xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Price History & Market Movement</h4>
            <p className="text-[11px] text-slate-400">Chronological verification logs across market checks</p>
          </div>
        </div>

        {/* Delta Tag */}
        <div
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border ${
            netDiff > 0
              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              : netDiff < 0
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : 'bg-slate-500/15 text-slate-300 border-slate-500/30'
          }`}
        >
          {netDiff > 0 ? (
            <>
              <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
              <span>+{formatCurrency(netDiff, currency)} (+{pctChange}%)</span>
            </>
          ) : netDiff < 0 ? (
            <>
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
              <span>-{formatCurrency(Math.abs(netDiff), currency)} ({pctChange}%)</span>
            </>
          ) : (
            <span>No price change</span>
          )}
        </div>
      </div>

      {/* SVG Trajectory Graph */}
      <div className="relative w-full h-[120px] bg-[#070a14] rounded-xl border border-white/5 overflow-hidden p-1">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full">
          {/* Subtle Grid Lines */}
          <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1={paddingX} y1={svgHeight / 2} x2={svgWidth - paddingX} y2={svgHeight / 2} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />

          {/* Area gradient under path */}
          <defs>
            <linearGradient id="priceLineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {allPoints.length > 1 && (
            <path
              d={`${pathData} L ${getX(allPoints.length - 1, allPoints.length)} ${svgHeight - paddingY} L ${getX(0, allPoints.length)} ${svgHeight - paddingY} Z`}
              fill="url(#priceLineGradient)"
            />
          )}

          {/* Line Path */}
          <path
            d={pathData}
            fill="none"
            stroke="#fbbf24"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {allPoints.map((p, idx) => {
            const cx = getX(idx, allPoints.length);
            const cy = getY(p.price);
            const isLatest = idx === allPoints.length - 1;
            return (
              <g key={idx}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isLatest ? 5 : 4}
                  fill={isLatest ? '#34d399' : '#fbbf24'}
                  stroke="#0b0e1a"
                  strokeWidth="2"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Logged points list */}
      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
        {allPoints.slice().reverse().map((p, idx) => {
          const dateStr = new Date(p.recordedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          const conf = CONFIDENCE_CONFIG[p.confidence as keyof typeof CONFIDENCE_CONFIG] || CONFIDENCE_CONFIG.VERIFIED;
          return (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-400">{dateStr}</span>
                {p.source && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 truncate max-w-[140px]">
                    {p.source}
                  </span>
                )}
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${conf.badgeClass}`}>
                  {conf.label}
                </span>
              </div>
              <span className="font-mono font-bold text-amber-300">
                {formatCurrency(p.price, currency)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
