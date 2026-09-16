'use client';

import React, { useState } from 'react';
import { ProductResearchResult, ResearchInput } from '@/lib/research/types';
import { CONFIDENCE_CONFIG, PriceConfidence } from '@/lib/types';
import { formatCurrency } from '@/lib/finance-calculator';
import { SafeImage } from '@/components/ui/safe-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PriceBreakdownCard } from './price-breakdown-card';
import { sounds } from '@/lib/sound';
import { INDIAN_STATES_RTO } from '@/lib/research/vehicle-price-engine';
import {
  Sparkles,
  Search,
  Globe,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  ExternalLink,
  Layers,
  ChevronDown,
  ChevronUp,
  Flame,
  ArrowRight,
  Store,
  Truck,
  Receipt,
} from 'lucide-react';

interface ScryingConsoleProps {
  onApplyResult: (result: ProductResearchResult) => void;
  onOpenExisting?: (dreamId: string) => void;
}

type ScryingStage =
  | 'IDLE'
  | 'IDENTIFYING'
  | 'CHECKING_SOURCES'
  | 'CHECKING_PRICE'
  | 'CALCULATING_COST'
  | 'READY';

export const ScryingConsole: React.FC<ScryingConsoleProps> = ({
  onApplyResult,
  onOpenExisting,
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [selectedState, setSelectedState] = useState('Karnataka');
  const [selectedCity, setSelectedCity] = useState('Bengaluru');
  const [stage, setStage] = useState<ScryingStage>('IDLE');
  const [result, setResult] = useState<ProductResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSpecs, setShowSpecs] = useState(false);

  const stageDescriptions: Record<ScryingStage, string> = {
    IDLE: 'Awaiting your command...',
    IDENTIFYING: '🌀 Scanning Akashic Grimoire (Identifying product & model)...',
    CHECKING_SOURCES: '🌐 Consulting Official Brands, Amazon India & Flipkart (Checking trusted sources)...',
    CHECKING_PRICE: '🏷️ Extracting Verified Merchant Selling Rates (Checking current price)...',
    CALCULATING_COST: '⚖️ Calculating Shipping, Mandatory Platform Fees & On-Road Taxes (Calculating final cost)...',
    READY: '✨ Scrying Complete!',
  };

  const handleScry = async (overrideState?: string) => {
    if (!inputQuery.trim()) return;
    setError(null);
    setResult(null);
    sounds.playClick();

    const effectiveState = overrideState || selectedState;

    try {
      // Anime stage progression
      setStage('IDENTIFYING');
      await new Promise((r) => setTimeout(r, 200));

      setStage('CHECKING_SOURCES');
      await new Promise((r) => setTimeout(r, 200));

      setStage('CHECKING_PRICE');
      
      const payload: ResearchInput = {
        query: inputQuery.startsWith('http') ? undefined : inputQuery.trim(),
        url: inputQuery.startsWith('http') ? inputQuery.trim() : undefined,
        locationState: effectiveState,
        locationCity: selectedCity,
      };

      const res = await fetch('/api/research/scry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setStage('CALCULATING_COST');
      await new Promise((r) => setTimeout(r, 150));

      if (!res.ok) {
        throw new Error('Research failed to retrieve product details');
      }

      const data: ProductResearchResult = await res.json();

      if (!data.success || !data.product) {
        setStage('IDLE');
        setError(
          data.error ||
            'Unable to verify this information automatically from trusted sources. You can proceed with manual entry.'
        );
        return;
      }

      setStage('READY');
      setResult(data);
      sounds.playChime();
    } catch (err: unknown) {
      setStage('IDLE');
      setError(err instanceof Error ? err.message : 'Failed to connect to research services');
    }
  };

  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    const found = INDIAN_STATES_RTO.find((s) => s.state === newState);
    if (found) setSelectedCity(found.city);
    if (result && result.product?.priceBreakdown) {
      handleScry(newState);
    }
  };

  const product = result?.product;
  const confidence = product?.priceConfidence || 'VERIFIED';
  const confConfig = CONFIDENCE_CONFIG[confidence] || CONFIDENCE_CONFIG.VERIFIED;

  return (
    <div className="space-y-4">
      {/* Search Bar Input */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#0e1322] to-[#0a0d16] border border-amber-500/30 shadow-2xl space-y-3.5">
        <div className="flex items-center justify-between flex-wrap gap-1">
          <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Akashic Universal Final Price Engine
          </label>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Trusted Sources: Official Brands &bull; Amazon India &bull; Flipkart</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Input
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="e.g. Logitech G Pro X Superlight 2, Razer DeathAdder V3 Pro, Sony WH-1000XM6, Nike Air Force 1, or paste URL..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleScry();
                }
              }}
              icon={<Search className="w-4 h-4 text-amber-400" />}
            />
          </div>

          <Button
            type="button"
            variant="gold"
            onClick={() => handleScry()}
            disabled={stage !== 'IDLE' && stage !== 'READY'}
            isLoading={stage !== 'IDLE' && stage !== 'READY'}
            className="sm:w-auto w-full"
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            Scry Price
          </Button>
        </div>

        {/* Location Selector for Vehicles */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-white/5 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-semibold text-slate-300">Vehicle On-Road State:</span>
          </div>
          <select
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            className="bg-[#0b0e18] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-amber-300 focus:outline-none focus:border-amber-500"
          >
            {INDIAN_STATES_RTO.map((s) => (
              <option key={s.state} value={s.state} className="bg-slate-900 text-white">
                {s.state} ({s.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Anime Loading State Stages */}
      {stage !== 'IDLE' && stage !== 'READY' && (
        <div className="p-4 rounded-2xl bg-[#0b0e1a] border border-amber-500/40 text-center space-y-3 animate-pulse">
          <div className="inline-flex p-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-glow-gold">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-300 font-mono">
              {stageDescriptions[stage]}
            </h4>
            <p className="text-xs text-slate-400 pt-1">
              Cross-referencing Official OEM rates, calculating shipping & platform fees...
            </p>
          </div>
        </div>
      )}

      {/* Error / Fallback Banner */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Verification Notice</span>
          </div>
          <p>{error}</p>
        </div>
      )}

      {/* Duplicate Warning Alert */}
      {result?.duplicateWarning?.isDuplicate && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Existing Quest Detected in Grimoire
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-200 font-mono">
              Status: {result.duplicateWarning.existingStatus}
            </span>
          </div>
          <p className="text-xs text-slate-300">
            You already have <strong className="text-white">&ldquo;{result.duplicateWarning.existingName}&rdquo;</strong> tracked at{' '}
            <span className="font-mono font-bold text-amber-300">
              {formatCurrency(result.duplicateWarning.existingPrice || 0, 'INR')}
            </span>
            .
          </p>
          <div className="flex gap-2 pt-1">
            {onOpenExisting && result.duplicateWarning.existingDreamId && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onOpenExisting(result.duplicateWarning!.existingDreamId!)}
              >
                Open Existing Quest
              </Button>
            )}
            <span className="text-[11px] text-slate-400 self-center">or continue below if this is a different trim</span>
          </div>
        </div>
      )}

      {/* Researched Product Review Card */}
      {result?.success && product && (
        <div className="p-5 rounded-2xl bg-[#0e1322] border border-amber-500/30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold border flex items-center gap-1.5 ${confConfig.badgeClass}`}>
                <span className={`w-2 h-2 rounded-full ${confConfig.dotClass}`} />
                {confConfig.label}
              </span>
              <span className="text-xs text-slate-400">
                {product.verifiedSource || product.sourceName || 'Trusted Source'}
              </span>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              Checked Today
            </div>
          </div>

          {/* Product Hero Info */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
            <div className="sm:col-span-4 relative rounded-xl overflow-hidden border border-white/10 aspect-[4/3] bg-[#090c14]">
              <SafeImage
                src={product.image}
                alt={product.name}
                category={product.category}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="sm:col-span-8 space-y-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-amber-400/90 tracking-wider uppercase">
                  {product.brand || product.category}
                </span>
                {product.variant && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {product.variant}
                  </span>
                )}
              </div>

              <h3 className="text-base sm:text-lg font-extrabold text-white leading-snug">
                {product.name}
              </h3>

              {product.description && (
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Universal Final Price Preview Box */}
              <div className="p-3.5 rounded-xl bg-[#090c14] border border-amber-500/30 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    {product.priceBreakdown?.type === 'VEHICLE_ON_ROAD' ? 'Final On-Road Price:' : 'Final Price to Own:'}
                  </span>
                  <div className="text-2xl font-black text-amber-300 font-mono">
                    {formatCurrency(product.finalPrice, product.currency)}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-[11px] font-mono text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Listed:</span>
                    <span className="font-bold">{formatCurrency(product.listedPrice, product.currency)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Shipping:</span>
                    <span className="font-bold">
                      {product.shippingCost && product.shippingCost > 0
                        ? formatCurrency(product.shippingCost, product.currency)
                        : '₹0 (Free)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Platform Fees:</span>
                    <span className="font-bold">
                      {product.mandatoryFees && product.mandatoryFees > 0
                        ? formatCurrency(product.mandatoryFees, product.currency)
                        : '₹0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Price Breakdown Accordion (Vehicles / Itemized) */}
          {product.priceBreakdown && (
            <PriceBreakdownCard breakdown={product.priceBreakdown} currency={product.currency} />
          )}

          {/* Specs Toggle */}
          {product.specs && (
            <div className="border-t border-white/10 pt-2">
              <button
                type="button"
                onClick={() => setShowSpecs(!showSpecs)}
                className="w-full py-1.5 flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-white"
              >
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  Technical Specifications & Attributes
                </span>
                {showSpecs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {showSpecs && (
                <div className="p-3 rounded-xl bg-[#090c14] border border-white/5 text-xs text-slate-300 whitespace-pre-line mt-2 font-mono">
                  {product.specs}
                </div>
              )}
            </div>
          )}

          {/* Apply Button */}
          <div className="pt-3 border-t border-white/10 flex justify-end">
            <Button
              type="button"
              variant="gold"
              size="md"
              onClick={() => {
                onApplyResult(result);
                sounds.playTierUp();
              }}
              className="w-full sm:w-auto"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Apply Researched Data to Quest
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
