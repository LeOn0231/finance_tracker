'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { sounds } from '@/lib/sound';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import {
  useTheme,
  THEME_CONFIGS,
  AnimeTheme,
  AnimationIntensity,
  AppCurrency,
} from '@/lib/theme-context';
import {
  Settings,
  Volume2,
  VolumeX,
  ShieldCheck,
  Database,
  Lock,
  Sparkles,
  CheckCircle2,
  Bell,
  EyeOff,
  Palette,
  Zap,
  DollarSign,
  Download,
  Upload,
  AlertTriangle,
  FileText,
  HelpCircle,
} from 'lucide-react';

export default function SettingsPage() {
  const {
    theme,
    setTheme,
    animationIntensity,
    setAnimationIntensity,
    currency,
    setCurrency,
  } = useTheme();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [adminUser, setAdminUser] = useState<{ username: string; email: string } | null>(null);

  // Import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setSoundEnabled(sounds.isEnabled());
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setAdminUser(data.user);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleToggleSound = () => {
    const newState = sounds.toggleSound();
    setSoundEnabled(newState);
  };

  const handleTestFanfare = () => {
    sounds.playQuestComplete();
  };

  const handleExport = (format: 'json' | 'csv') => {
    sounds.playClick();
    window.location.href = `/api/data/export?format=${format}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
      setImportError(null);
    }
  };

  const handleImportSubmit = async () => {
    if (!importFile) {
      setImportError('Please select a Life Quest backup JSON file.');
      return;
    }

    try {
      setIsImporting(true);
      setImportError(null);
      setImportSuccess(null);

      const text = await importFile.text();
      const jsonData = JSON.parse(text);

      const res = await fetch('/api/data/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to import data');
      }

      sounds.playQuestComplete();
      setImportSuccess(data.message || 'Data imported successfully!');
      setImportFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: unknown) {
      setImportError(err instanceof Error ? err.message : 'Invalid JSON file structure');
    } finally {
      setIsImporting(false);
    }
  };

  const currencies: { code: AppCurrency; symbol: string; label: string }[] = [
    { code: 'INR', symbol: '₹', label: 'Indian Rupee (INR)' },
    { code: 'USD', symbol: '$', label: 'US Dollar (USD)' },
    { code: 'EUR', symbol: '€', label: 'Euro (EUR)' },
    { code: 'GBP', symbol: '£', label: 'British Pound (GBP)' },
    { code: 'JPY', symbol: '¥', label: 'Japanese Yen (JPY)' },
  ];

  return (
    <AppShell>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span>Preferences & System Control</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Settings & Sanctuary Config
          </h1>
          <p className="text-sm text-slate-400">
            Customize your visual theme, animation intensity, sound FX, and data backups.
          </p>
        </div>

        {/* 1. Theme & Mood System (8 Anime Themes) */}
        <div className="p-6 rounded-3xl bg-[#121624]/90 border border-white/10 shadow-xl space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-400" />
                <span>Anime Aesthetic & Grimoire Theme</span>
              </h3>
              <p className="text-xs text-slate-400">
                Switch visual atmosphere, lighting runes, and ambient accent colors across the entire sanctuary.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Active: {THEME_CONFIGS[theme]?.name}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.values(THEME_CONFIGS).map((t) => {
              const isSelected = theme === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    sounds.playClick();
                    setTheme(t.id as AnimeTheme);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden ${
                    isSelected
                      ? 'bg-[#181d33] border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-2 ring-amber-400/50'
                      : 'bg-[#0e111d]/80 border-white/5 hover:border-white/20 hover:bg-[#141829]'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{t.icon}</span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: t.primaryColor }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: t.accentColor }}
                        />
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-white leading-tight">{t.name}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="pt-2 border-t border-white/10 flex items-center gap-1 text-[10px] font-bold text-amber-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Equipped Theme</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Animation Intensity & Reduced Motion */}
        <div className="p-6 rounded-3xl bg-[#121624]/90 border border-white/10 shadow-xl space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span>Animation Intensity & Motion Accessibility</span>
            </h3>
            <p className="text-xs text-slate-400">
              Control the intensity of particle bursts, hovering auras, and card transitions. Respects OS reduced motion settings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'FULL', label: 'Full Dynamic', desc: 'All particles, glowing aura pulses, confetti, and transitions.' },
              { id: 'REDUCED', label: 'Reduced Motion', desc: 'Subtle transitions only. Disables pulsing loops and particle bursts.' },
              { id: 'OFF', label: 'Animations Off', desc: 'Completely static presentation for high efficiency.' },
            ].map((opt) => (
              <div
                key={opt.id}
                onClick={() => {
                  sounds.playClick();
                  setAnimationIntensity(opt.id as AnimationIntensity);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  animationIntensity === opt.id
                    ? 'bg-purple-500/15 border-purple-500/50 shadow-glow-violet ring-1 ring-purple-500'
                    : 'bg-[#0a0d16] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white">{opt.label}</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{opt.desc}</p>
                </div>
                {animationIntensity === opt.id && (
                  <span className="text-[10px] font-bold text-purple-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Selected
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 3. Currency Preferences */}
        <div className="p-6 rounded-3xl bg-[#121624]/90 border border-white/10 shadow-xl space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Sanctuary Currency Display</span>
            </h3>
            <p className="text-xs text-slate-400">
              Choose your primary currency symbol format for dream purchases and monthly budgets.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {currencies.map((curr) => (
              <button
                key={curr.code}
                onClick={() => {
                  sounds.playClick();
                  setCurrency(curr.code);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                  currency === curr.code
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-glow-emerald'
                    : 'bg-[#0a0d16] text-slate-400 hover:text-slate-200 border-white/5'
                }`}
              >
                <span className="font-mono text-sm">{curr.symbol}</span>
                <span>{curr.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Synthesized Audio SFX */}
        <div className="p-6 rounded-3xl bg-[#121624]/90 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>Synthesized Web Audio SFX</span>
              </h3>
              <p className="text-xs text-slate-400">
                Synthesizes retro 8-bit / anime victory fanfare, rank-up chimes, and interaction clicks without loading external audio assets.
              </p>
            </div>

            <button
              onClick={handleToggleSound}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                soundEnabled
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-glow-gold'
                  : 'bg-white/5 text-slate-400 border-white/10'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? 'Enabled' : 'Muted'}</span>
            </button>
          </div>

          <div className="pt-2 border-t border-white/5 flex gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleTestFanfare}
              disabled={!soundEnabled}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-400" />
              Test Victory Fanfare
            </Button>
          </div>
        </div>

        {/* 5. Data Export & Import */}
        <div className="p-6 rounded-3xl bg-[#121624]/90 border border-white/10 shadow-xl space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Data Export & Backup Recovery</span>
            </h3>
            <p className="text-xs text-slate-400">
              Download complete private data snapshots or restore your Grimoire from a previous backup.
            </p>
          </div>

          {/* Privacy Security Warning Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>This export contains private financial information. Store it securely.</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleExport('json')}
              className="w-full flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export Full JSON</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => handleExport('csv')}
              className="w-full flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Export Dreams CSV</span>
            </Button>

            <Button
              type="button"
              variant="gold"
              onClick={() => {
                sounds.playClick();
                setIsImportModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Import Backup JSON</span>
            </Button>
          </div>
        </div>

        {/* 6. Admin Account & Privacy Posture */}
        <div className="p-6 rounded-3xl bg-[#121624]/90 border border-white/10 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Administrator Identity & Privacy Posture</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#0a0d16] border border-white/5 space-y-1">
              <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Username</span>
              <span className="font-bold text-slate-200 text-sm">
                {adminUser?.username || 'admin'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0a0d16] border border-white/5 space-y-1">
              <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Admin Email</span>
              <span className="font-bold text-slate-200 text-sm">
                {adminUser?.email || 'admin@lifequest.local'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0a0d16] border border-white/5 space-y-1">
              <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Search Engine Blocking</span>
              <span className="font-bold text-rose-400 text-sm flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5" />
                Active (noindex, nofollow)
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0a0d16] border border-white/5 space-y-1">
              <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Session Protection</span>
              <span className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Signed JWT (HttpOnly Cookie)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Import JSON Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        maxWidth="md"
        title={
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-400" />
            <span className="text-base font-bold text-white">Import Life Quest Backup</span>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Privacy Warning Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Private Financial Information Notice</span>
            </div>
            <p className="text-slate-300">
              This file contains private financial and purchase information. Imported data will be validated and merged with your current Grimoire records.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Select Backup JSON File
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500/20 file:text-amber-300 hover:file:bg-amber-500/30 cursor-pointer"
            />
          </div>

          {importError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {importError}
            </div>
          )}

          {importSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{importSuccess}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsImportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="gold"
              onClick={handleImportSubmit}
              disabled={!importFile || isImporting}
              isLoading={isImporting}
            >
              Import Data
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
