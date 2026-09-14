'use client';

import React, { useState, useEffect } from 'react';
import {
  DreamPurchaseItem,
  DreamType,
  PriorityTier,
  DreamStatus,
  DREAM_CATEGORIES,
  PRIORITY_TIERS,
} from '@/lib/types';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { SafeImage } from '@/components/ui/safe-image';
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
  Sliders,
  Check,
} from 'lucide-react';

interface AddDreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<DreamPurchaseItem>) => Promise<void>;
  initialData?: DreamPurchaseItem | null;
  defaultType?: DreamType;
}

export const AddDreamModal: React.FC<AddDreamModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultType = 'BIG_DREAM',
}) => {
  const isEditing = Boolean(initialData);

  const [inputMode, setInputMode] = useState<'STANDARD' | 'FAST_URL'>('STANDARD');
  const [fastInput, setFastInput] = useState('');

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync initialData when editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setBrand(initialData.brand || '');
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
    } else {
      // Reset form
      setName('');
      setBrand('');
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
      setFastInput('');
      setError(null);
    }
  }, [initialData, defaultType, isOpen]);

  // Fast input parser (URL or natural language string)
  const handleFastParse = () => {
    if (!fastInput.trim()) return;
    const text = fastInput.trim();

    if (text.startsWith('http://') || text.startsWith('https://')) {
      try {
        const parsedUrl = new URL(text);
        setSourceUrl(text);
        setSourceName(parsedUrl.hostname.replace('www.', ''));
        // Try extracting product slug as starter name
        const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
        if (pathSegments.length > 0) {
          const lastSegment = pathSegments[pathSegments.length - 1];
          const guessedName = decodeURIComponent(lastSegment)
            .replace(/[-_]/g, ' ')
            .replace(/\.html?$/i, '');
          if (guessedName.length > 2) {
            setName(guessedName.charAt(0).toUpperCase() + guessedName.slice(1));
          }
        }
      } catch {
        setName(text);
      }
    } else {
      // Natural language name
      setName(text);
      // Guess category and type from keywords
      const lower = text.toLowerCase();
      if (lower.includes('car') || lower.includes('bike') || lower.includes('motorcycle') || lower.includes('meteor') || lower.includes('bullet') || lower.includes('porsche')) {
        setCategory('Vehicles');
        setType('BIG_DREAM');
        setPriority('S_TIER');
      } else if (lower.includes('headphone') || lower.includes('earphone') || lower.includes('sony wh') || lower.includes('audio') || lower.includes('speaker')) {
        setCategory('Audio & Tech');
        setType('SMALL_DREAM');
      } else if (lower.includes('manga') || lower.includes('book') || lower.includes('clover') || lower.includes('berserk')) {
        setCategory('Manga & Books');
        setType('SMALL_DREAM');
      } else if (lower.includes('figure') || lower.includes('statue') || lower.includes('nendoroid') || lower.includes('scale')) {
        setCategory('Anime & Figures');
        setType('SMALL_DREAM');
      } else if (lower.includes('pc') || lower.includes('rtx') || lower.includes('macbook') || lower.includes('battlestation') || lower.includes('camera')) {
        setCategory('Electronics & PC');
        setType('BIG_DREAM');
      }
    }
    sounds.playTierUp();
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
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save dream quest');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          ? 'Modify your goal targets, progress, or attributes.'
          : 'Define your next dream acquisition with rich specifications.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quick URL / Natural Language Scryer */}
        {!isEditing && (
          <div className="p-4 rounded-2xl bg-[#0b0e18] border border-amber-500/20 shadow-inner space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                Quick Inscribe (URL or Natural Language)
              </label>
              <span className="text-[11px] text-slate-400">e.g. Sony WH-1000XM6 or product link</span>
            </div>
            <div className="flex gap-2">
              <Input
                value={fastInput}
                onChange={(e) => setFastInput(e.target.value)}
                placeholder="Paste URL or type product name (e.g. Royal Enfield Super Meteor 650)..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleFastParse();
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={handleFastParse}>
                Scry
              </Button>
            </div>
          </div>
        )}

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
                onChange={(e) => setName(e.target.value)}
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
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Royal Enfield"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
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
                  Target Price ($)
                </label>
                <Input
                  type="number"
                  step="any"
                  value={finalPrice}
                  onChange={(e) => setFinalPrice(e.target.value)}
                  placeholder="0"
                  icon={<DollarSign className="w-3.5 h-3.5" />}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Listed Price ($)
                </label>
                <Input
                  type="number"
                  step="any"
                  value={listedPrice}
                  onChange={(e) => setListedPrice(e.target.value)}
                  placeholder="0"
                  icon={<DollarSign className="w-3.5 h-3.5" />}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Amount Saved ($)
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
                <span className="text-[10px] text-slate-400 font-normal">Unsplash / direct image link</span>
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
                  placeholder="e.g. Amazon, Sony, Official"
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
                placeholder="e.g. Reward for completing Phase 1 milestones..."
                rows={2}
                className="w-full bg-[#0d101a]/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>
        </div>

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
    </Modal>
  );
};
