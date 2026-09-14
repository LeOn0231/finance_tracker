'use client';

import React, { useState, useEffect } from 'react';
import {
  DreamPurchaseItem,
  DreamType,
  PriorityTier,
  DreamStatus,
  DREAM_CATEGORIES,
  PRIORITY_TIERS,
  PriceConfidence,
  PriceBreakdown,
  CONFIDENCE_CONFIG,
} from '@/lib/types';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SafeImage } from '@/components/ui/safe-image';
import { ScryingConsole } from '@/components/research/scrying-console';
import { PriceBreakdownCard } from '@/components/research/price-breakdown-card';
import { ProductResearchResult } from '@/lib/research/types';
import { sounds } from '@/lib/sound';
import {
  Sparkles,
  Link as LinkIcon,
  DollarSign,
  Tag,
  Layers,
  Image as ImageIcon,
  Flame,
  Globe,
  MapPin,
  Edit3,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface AddDreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<DreamPurchaseItem>) => Promise<void>;
  initialData?: DreamPurchaseItem | null;
  defaultType?: DreamType;
  onOpenExisting?: (dreamId: string) => void;
}

export const AddDreamModal: React.FC<AddDreamModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultType = 'BIG_DREAM',
  onOpenExisting,
}) => {
  const isEditing = Boolean(initialData);

  const [activeTab, setActiveTab] = useState<'SCRYER' | 'MANUAL'>(isEditing ? 'MANUAL' : 'SCRYER');

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [variant, setVariant] = useState('');
  const [category, setCategory] = useState<string>('Electronics & PC');
  const [type, setType] = useState<DreamType>(defaultType);
  const [priority, setPriority] = useState<PriorityTier>('A_TIER');
  const [status, setStatus] = useState<DreamStatus>('DREAMING');
  const [listedPrice, setListedPrice] = useState<string>('0');
  const [finalPrice, setFinalPrice] = useState<string>('0');
  const [amountSaved, setAmountSaved] = useState<string>('0');
  const [image, setImage] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [specs, setSpecs] = useState('');
  const [notes, setNotes] = useState('');
  const [isCurrentQuest, setIsCurrentQuest] = useState(false);

  // Phase 4 states
  const [priceConfidence, setPriceConfidence] = useState<PriceConfidence>('VERIFIED');
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [locationState, setLocationState] = useState<string>('');
  const [locationCity, setLocationCity] = useState<string>('');
  const [isManualOverride, setIsManualOverride] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync initialData when editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setBrand(initialData.brand || '');
      setModel(initialData.model || '');
      setVariant(initialData.variant || '');
      setCategory(initialData.category || 'General');
      setType(initialData.type || defaultType);
      setPriority(initialData.priority || 'A_TIER');
      setStatus(initialData.status || 'DREAMING');
      setListedPrice(String(initialData.listedPrice || 0));
      setFinalPrice(String(initialData.finalPrice || initialData.listedPrice || 0));
      setAmountSaved(String(initialData.amountSaved || 0));
      setImage(initialData.image || '');
      setSourceUrl(initialData.sourceUrl || '');
      setSourceName(initialData.sourceName || '');
      setSpecs(initialData.specs || '');
      setNotes(initialData.notes || '');
      setIsCurrentQuest(Boolean(initialData.isCurrentQuest));

      setPriceConfidence(initialData.priceConfidence || 'VERIFIED');
      if (initialData.priceBreakdown) {
        if (typeof initialData.priceBreakdown === 'string') {
          try {
            setPriceBreakdown(JSON.parse(initialData.priceBreakdown));
          } catch {
            setPriceBreakdown(null);
          }
        } else {
          setPriceBreakdown(initialData.priceBreakdown);
        }
      } else {
        setPriceBreakdown(null);
      }
      setLocationState(initialData.locationState || '');
      setLocationCity(initialData.locationCity || '');
      setIsManualOverride(Boolean(initialData.isManualOverride));
      setActiveTab('MANUAL');
    } else {
      // Reset form
      setName('');
      setBrand('');
      setModel('');
      setVariant('');
      setCategory('Electronics & PC');
      setType(defaultType);
      setPriority('A_TIER');
      setStatus('DREAMING');
      setListedPrice('0');
      setFinalPrice('0');
      setAmountSaved('0');
      setImage('');
      setSourceUrl('');
      setSourceName('');
      setSpecs('');
      setNotes('');
      setIsCurrentQuest(false);

      setPriceConfidence('VERIFIED');
      setPriceBreakdown(null);
      setLocationState('');
      setLocationCity('');
      setIsManualOverride(false);
      setActiveTab('SCRYER');
      setError(null);
    }
  }, [initialData, defaultType, isOpen]);

  // Handle applying researched product from ScryingConsole
  const handleApplyResearchedProduct = (res: ProductResearchResult) => {
    if (!res.product) return;
    const p = res.product;

    setName(p.name);
    if (p.brand) setBrand(p.brand);
    if (p.model) setModel(p.model);
    if (p.variant) setVariant(p.variant);
    if (p.category) setCategory(p.category);
    if (p.image) setImage(p.image);
    if (p.sourceUrl) setSourceUrl(p.sourceUrl);
    if (p.sourceName) setSourceName(p.sourceName);
    if (p.specs) setSpecs(p.specs);

    setListedPrice(String(p.listedPrice));
    setFinalPrice(String(p.finalPrice));
    setPriceConfidence(p.priceConfidence);
    if (p.priceBreakdown) setPriceBreakdown(p.priceBreakdown);
    if (p.locationState) setLocationState(p.locationState);
    if (p.locationCity) setLocationCity(p.locationCity);

    // Auto classify quest type based on magnitude
    if (p.category === 'Vehicles' || p.finalPrice >= 50000) {
      setType('BIG_DREAM');
      setPriority(p.finalPrice >= 200000 ? 'S_TIER' : 'A_TIER');
    } else {
      setType('SMALL_DREAM');
    }

    setIsManualOverride(false);
    setActiveTab('MANUAL');
  };

  const handlePrioritySelect = (tier: PriorityTier) => {
    setPriority(tier);
    sounds.playTierUp();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide a name for this dream quest.');
      return;
    }

    const listed = parseFloat(listedPrice) || 0;
    const final_ = parseFloat(finalPrice) || listed || 0;
    const saved = parseFloat(amountSaved) || 0;

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        brand: brand.trim() || null,
        model: model.trim() || null,
        variant: variant.trim() || null,
        category,
        type,
        priority,
        status,
        listedPrice: listed,
        finalPrice: final_,
        amountSaved: saved,
        image: image.trim() || null,
        sourceUrl: sourceUrl.trim() || null,
        sourceName: sourceName.trim() || null,
        specs: specs.trim() || null,
        notes: notes.trim() || null,
        isCurrentQuest,
        
        priceConfidence,
        priceBreakdown: priceBreakdown ? JSON.stringify(priceBreakdown) : null,
        locationState: locationState || null,
        locationCity: locationCity || null,
        isManualOverride,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save dream quest');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confInfo = CONFIDENCE_CONFIG[priceConfidence] || CONFIDENCE_CONFIG.VERIFIED;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title={
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>{isEditing ? 'Edit Grimoire Quest' : 'Inscribe New Dream Quest'}</span>
        </div>
      }
      subtitle={
        isEditing
          ? 'Modify your target goals, specs, price breakdown, or attributes.'
          : 'Scry products with automated pricing or inscribe manual quest parameters.'
      }
    >
      <div className="space-y-6">
        {/* Navigation Tabs (Scryer vs Manual Entry) */}
        {!isEditing && (
          <div className="flex rounded-2xl bg-[#090c16] p-1.5 border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('SCRYER')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'SCRYER'
                  ? 'bg-amber-500 text-black shadow-glow-gold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              🔮 Akashic Product Scryer (Automated)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('MANUAL')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'MANUAL'
                  ? 'bg-purple-600 text-white shadow-glow-violet'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              📜 Manual Grimoire Inscription
            </button>
          </div>
        )}

        {/* Tab 1: Scrying Console */}
        {activeTab === 'SCRYER' && !isEditing && (
          <ScryingConsole
            onApplyResult={handleApplyResearchedProduct}
            onOpenExisting={onOpenExisting}
          />
        )}

        {/* Tab 2: Manual / Form Review */}
        {(activeTab === 'MANUAL' || isEditing) && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status & Confidence Banner */}
            <div className="flex items-center justify-between flex-wrap gap-2 p-3 rounded-xl bg-[#0b0e18] border border-white/10">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${confInfo.badgeClass}`}>
                  {confInfo.label}
                </span>
                {isManualOverride && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1 font-semibold">
                    <Edit3 className="w-3 h-3" />
                    MANUAL OVERRIDE
                  </span>
                )}
              </div>

              {locationState && (
                <div className="text-xs text-purple-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{locationCity ? `${locationCity}, ` : ''}{locationState}</span>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left Column: Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Quest Name *
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setIsManualOverride(true);
                    }}
                    placeholder="e.g. Royal Enfield Super Meteor 650"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Brand / Maker
                    </label>
                    <Input
                      value={brand}
                      onChange={(e) => {
                        setBrand(e.target.value);
                        setIsManualOverride(true);
                      }}
                      placeholder="e.g. Royal Enfield"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        setIsManualOverride(true);
                      }}
                      className="w-full bg-[#0d101a]/90 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
                    >
                      {DREAM_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-slate-900 text-white">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Model & Variant */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Model
                    </label>
                    <Input
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="e.g. Super Meteor 650"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Variant / Trim
                    </label>
                    <Input
                      value={variant}
                      onChange={(e) => setVariant(e.target.value)}
                      placeholder="e.g. Stellar Marine Blue"
                    />
                  </div>
                </div>

                {/* Type & Current Quest Toggle */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Quest Magnitude
                    </label>
                    <div className="flex rounded-xl bg-[#0b0e18] p-1 border border-white/10">
                      <button
                        type="button"
                        onClick={() => setType('BIG_DREAM')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          type === 'BIG_DREAM'
                            ? 'bg-amber-500 text-black shadow-glow-gold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        👑 Big Dream
                      </button>
                      <button
                        type="button"
                        onClick={() => setType('SMALL_DREAM')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          type === 'SMALL_DREAM'
                            ? 'bg-purple-600 text-white shadow-glow-violet'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        ✨ Small Dream
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Main Focus
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCurrentQuest(!isCurrentQuest)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                        isCurrentQuest
                          ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-glow-gold'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Flame className={`w-3.5 h-3.5 ${isCurrentQuest ? 'text-amber-400 fill-amber-400' : ''}`} />
                      {isCurrentQuest ? 'Active Main Quest' : 'Set as Main Quest'}
                    </button>
                  </div>
                </div>

                {/* Priority Tier Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Priority Rank Tier
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(['S_TIER', 'A_TIER', 'B_TIER', 'C_TIER', 'D_TIER'] as PriorityTier[]).map((tierKey) => {
                      const t = PRIORITY_TIERS[tierKey];
                      const isSelected = priority === tierKey;
                      return (
                        <button
                          key={tierKey}
                          type="button"
                          onClick={() => handlePrioritySelect(tierKey)}
                          className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-0.5 ${
                            isSelected
                              ? `${t.badgeClass} ring-2 ring-amber-400/50 scale-105`
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span>{t.label}</span>
                          <span className="text-[9px] font-normal opacity-75">{t.sublabel.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Status Progression
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as DreamStatus)}
                    className="w-full bg-[#0d101a]/90 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="DREAMING" className="bg-slate-900 text-white">✨ Dreaming (Initial Wish)</option>
                    <option value="PLANNING" className="bg-slate-900 text-white">🧭 Planning (Researching specs & price)</option>
                    <option value="SAVING" className="bg-slate-900 text-white">💰 Saving (Allocating funds)</option>
                    <option value="READY_TO_BUY" className="bg-slate-900 text-white">⚡ Ready to Buy (Target reached)</option>
                    <option value="PURCHASED" className="bg-slate-900 text-white">🏆 Purchased (In Hall of Fame)</option>
                  </select>
                </div>
              </div>

              {/* Right Column: Financials, Image & Specs */}
              <div className="space-y-4">
                {/* Price Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Final Target (₹) *
                    </label>
                    <Input
                      type="number"
                      step="any"
                      value={finalPrice}
                      onChange={(e) => {
                        setFinalPrice(e.target.value);
                        setIsManualOverride(true);
                      }}
                      placeholder="0"
                      icon={<DollarSign className="w-3.5 h-3.5" />}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Listed/MSRP (₹)
                    </label>
                    <Input
                      type="number"
                      step="any"
                      value={listedPrice}
                      onChange={(e) => {
                        setListedPrice(e.target.value);
                        setIsManualOverride(true);
                      }}
                      placeholder="0"
                      icon={<DollarSign className="w-3.5 h-3.5" />}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Amount Saved (₹)
                    </label>
                    <Input
                      type="number"
                      step="any"
                      value={amountSaved}
                      onChange={(e) => setAmountSaved(e.target.value)}
                      placeholder="0"
                      icon={<DollarSign className="w-3.5 h-3.5" />}
                    />
                  </div>
                </div>

                {/* Image URL with live preview thumbnail */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Image URL</span>
                    <span className="text-[10px] text-slate-400 font-normal">Direct image or Unsplash link</span>
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      icon={<ImageIcon className="w-3.5 h-3.5" />}
                    />
                    <div className="w-11 h-11 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 bg-[#0b0e18]">
                      <SafeImage src={image} alt="Preview" category={category} className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                {/* Source Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Source Store / Site
                    </label>
                    <Input
                      value={sourceName}
                      onChange={(e) => setSourceName(e.target.value)}
                      placeholder="e.g. Royal Enfield Official"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Source URL
                    </label>
                    <Input
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      placeholder="https://..."
                      icon={<LinkIcon className="w-3.5 h-3.5" />}
                    />
                  </div>
                </div>

                {/* Specifications & Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-amber-400" />
                    Specifications & Attributes
                  </label>
                  <textarea
                    value={specs}
                    onChange={(e) => setSpecs(e.target.value)}
                    placeholder="e.g. 648cc engine, 47 BHP, Celestial Blue, Touring Seat..."
                    rows={2}
                    className="w-full bg-[#0d101a]/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-purple-400" />
                    Quest Notes & Motivation
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Motivation for saving..."
                    rows={2}
                    className="w-full bg-[#0d101a]/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Price Breakdown Preview (if vehicle or component breakdown exists) */}
            {priceBreakdown && (
              <div className="pt-2 border-t border-white/10">
                <PriceBreakdownCard breakdown={priceBreakdown} currency="INR" compact />
              </div>
            )}

            {/* Action Footer */}
            <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="gold" size="lg" isLoading={isSubmitting}>
                <Sparkles className="w-4 h-4 mr-2" />
                {isEditing ? 'Save Quest Updates' : 'Inscribe in Grimoire'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
