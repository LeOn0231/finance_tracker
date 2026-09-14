'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Lock, User, ShieldAlert, KeyRound, ShieldCheck } from 'lucide-react';
import { sounds } from '@/lib/sound';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('ChangeMeQuest2025!');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    sounds.playClick();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      sounds.playQuestComplete();
      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid admin credentials');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#07090e]">
      {/* Background Animated Gradients */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative w-full max-w-md z-10">
        <div className="rounded-3xl bg-[#101422]/90 border border-white/[0.12] p-8 shadow-2xl backdrop-blur-2xl overflow-hidden relative">
          {/* Top Grimoire Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-700 p-0.5 shadow-glow-gold mb-4 animate-glow-bounce">
              <div className="w-full h-full bg-[#0a0d16] rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-amber-400" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Life Quest
            </h1>
            <p className="text-xs text-amber-400/90 font-mono tracking-widest uppercase mt-1">
              Private Admin Sanctuary
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Inscribe and conquer your ultimate dreams.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-300 text-xs font-medium animate-shake">
              <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Username or Email
              </label>
              <Input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin"
                icon={<User className="w-4 h-4" />}
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Master Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                icon={<Lock className="w-4 h-4" />}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                <KeyRound className="w-4 h-4 mr-2" />
                Unseal Grimoire
              </Button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="mt-8 pt-5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Single-Admin Encrypted Session</span>
            </div>
            <span className="font-mono">NOINDEX</span>
          </div>
        </div>
      </div>
    </div>
  );
}
