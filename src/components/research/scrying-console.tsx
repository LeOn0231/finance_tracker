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
} from 'lucide-react';

interface ScryingConsoleProps {
  onApplyResult: (result: ProductResearchResult) => void;
  onOpenExisting?: (dreamId: string) => void;
}

type ScryingStage = 'IDLE' | 'IDENTIFYING' | 'CHECKING_SOURCES' | 'CHECKING_PRICE' | 'CALCULATING_COST' | 'READY';

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
    IDENTIFYING: '🌀 Scanning Akashic Grimoire (Identifying item)...',
    CHECKING_SOURCES: '🌐 Consulting Official Guilds & Manufacturers (Checking sources)...',
    CHECKING_PRICE: '🏷️ Extracting Merchant Rates (Checking current price)...',
    CALCULATING_COST: '⚖️ Balancing Royal Taxes & Statutory Fees (Calculating final cost)...',
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
      await new Promise((r) => setTimeout(r, 250));

      setStage('CHECKING_SOURCES');
      await new Promise((r) => setTimeout(r, 250));

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
      await new Promise((r) => setTimeout(r, 200));

      if (!res.ok) {
        throw new Error('Research failed to retrieve product details');
      }

      const data: ProductResearchResult = await res.json();

      if (!data.success || !data.product) {
        setStage('IDLE');
        setError(data.error || 'Unable to verify this information automatically. You can proceed with manual entry.');
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
      <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0e1322] to-[#0a0d16] border border-amber-500/30 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Akashic Product Scryer
          </label>
          <span className="text-[11px] text-slate-400">URL, Model Name, or Description</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Input
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="e.g. Royal Enfield Super Meteor 650 Stellar Marine Blue or paste URL..."
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
            Scry Dream
          </Button>
        </div>

        {/* Location Selector for Vehicles */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-white/5 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-semibold text-slate-300">Vehicle On-Road Location:</span>
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
              Extracting OEM rates, calculating statutory fees & verifying duplicate records...
            </p>
          </div>
        </div>
      )}

      {/* Error / Fallback Banner */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Research Scrying Notice</span>
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
            <span className="text-[11px] text-slate-400 self-center">or continue below if this is a different variant</span>
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
                {confConfig.sublabel}
              </span>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              Checked {new Date(product.checkedAt).toLocaleTimeString()}
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

            <div className="sm:col-span-8 space-y-2">
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

              {/* Price comparison */}
              <div className="p-3 rounded-xl bg-[#090c14] border border-white/5 flex items-baseline justify-between">
                <span className="text-xs text-slate-400">
                  {product.priceBreakdown ? 'Final On-Road Price' : 'Verified Price to Own'}
                </span>
                <div className="flex items-baseline gap-2">
                  {product.listedPrice !== product.finalPrice && (
                    <span className="text-xs text-slate-500 line-through">
                      {formatCurrency(product.listedPrice, product.currency)}
                    </span>
                  )}
                  <span className="text-xl font-extrabold text-amber-300 font-mono">
                    {formatCurrency(product.finalPrice, product.currency)}
                  </span>
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
