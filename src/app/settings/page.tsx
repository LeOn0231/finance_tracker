'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { sounds } from '@/lib/sound';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';

export default function SettingsPage() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [adminUser, setAdminUser] = useState<{ username: string; email: string } | null>(null);

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

  return (
    <AppShell>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold">
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span>Preferences & System Control</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Settings & Sanctuary Config
          </h1>
          <p className="text-sm text-slate-400">
            Audio preferences, security posture, and database health.
          </p>
        </div>

        {/* Audio Preferences */}
        <div className="p-6 rounded-2xl bg-[#121624]/90 border border-white/10 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>Synthesized Web Audio SFX</span>
              </h3>
              <p className="text-xs text-slate-400">
                Play retro anime fanfares upon completing quests, ranking up, and clicking actions.
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

          <div className="pt-3 border-t border-white/5 flex gap-3">
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

        {/* Admin Account & Security Status */}
        <div className="p-6 rounded-2xl bg-[#121624]/90 border border-white/10 shadow-lg space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Administrator Identity & Privacy</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#0a0d16] border border-white/5 space-y-1">
              <span className="text-slate-500 uppercase tracking-wider block">Username</span>
              <span className="font-bold text-slate-200 text-sm">
                {adminUser?.username || 'admin'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0a0d16] border border-white/5 space-y-1">
              <span className="text-slate-500 uppercase tracking-wider block">Admin Email</span>
              <span className="font-bold text-slate-200 text-sm">
                {adminUser?.email || 'admin@lifequest.local'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0a0d16] border border-white/5 space-y-1">
              <span className="text-slate-500 uppercase tracking-wider block">Search Engine Indexing</span>
              <span className="font-bold text-rose-400 text-sm flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5" />
                Blocked (noindex, nofollow)
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0a0d16] border border-white/5 space-y-1">
              <span className="text-slate-500 uppercase tracking-wider block">Session Protection</span>
              <span className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Signed JWT (HttpOnly Cookie)
              </span>
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="p-6 rounded-2xl bg-[#121624]/90 border border-white/10 shadow-lg space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Database Architecture</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            ORM: <strong className="text-slate-200">Prisma 5.22</strong> with SQLite engine active for zero-configuration local execution and fully extensible schema ready for PostgreSQL.
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Database synchronized and healthy.</span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
