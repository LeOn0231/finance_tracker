'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { sounds } from '@/lib/sound';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  LayoutDashboard,
  Crown,
  Compass,
  Wallet,
  Trophy,
  TrendingUp,
  Award,
  Settings,
  LogOut,
  Volume2,
  VolumeX,
  Plus,
  Menu,
  X,
  Shield,
  Zap,
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
  onOpenAddDream?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({ children, onOpenAddDream }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundActive, setSoundActive] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setSoundActive(sounds.isEnabled());
  }, []);

  const handleToggleSound = () => {
    const newState = sounds.toggleSound();
    setSoundActive(newState);
  };

  const handleLogout = async () => {
    sounds.playClick();
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Big Dreams', href: '/big-dreams', icon: Crown, highlight: 'text-amber-400' },
    { name: 'Small Dreams', href: '/small-dreams', icon: Compass, highlight: 'text-purple-400' },
    { name: 'Money', href: '/money', icon: Wallet },
    { name: 'Purchased', href: '/purchased', icon: Trophy, highlight: 'text-teal-400' },
    { name: 'Progress', href: '/progress', icon: TrendingUp },
    { name: 'Achievements', href: '/achievements', icon: Award },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#090b10] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Cyber / Grimoire Header */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#0c0f18]/85 backdrop-blur-xl">
        {/* Top Gold Accent Stripe */}
        <div className="h-0.5 w-full bg-gradient-to-r from-amber-500/80 via-purple-500/80 to-amber-500/80" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* Logo / Brand */}
            <Link
              href="/"
              className="flex items-center gap-3 group focus:outline-none"
              onClick={() => sounds.playClick()}
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 p-0.5 shadow-glow-gold group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#0e121e] rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-amber-300 transition-colors">
                    Life Quest
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 font-black rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase -mt-0.5 hidden sm:block">
                  Grimoire of Ambition
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 bg-[#121624]/60 p-1.5 rounded-2xl border border-white/[0.06] overflow-x-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => sounds.playClick()}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-glow-gold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : item.highlight || 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Add Dream CTA */}
              {onOpenAddDream && (
                <Button
                  onClick={onOpenAddDream}
                  variant="gold"
                  size="sm"
                  className="hidden sm:inline-flex"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Dream
                </Button>
              )}

              {/* Sound FX Toggle */}
              <button
                onClick={handleToggleSound}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-amber-300 border border-white/10 transition-colors"
                title={soundActive ? 'Sound FX On (Click to Mute)' : 'Sound FX Muted (Click to Enable)'}
                aria-label="Toggle Sound Effects"
              >
                {soundActive ? (
                  <Volume2 className="w-4 h-4 text-amber-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-rose-500/15 text-slate-400 hover:text-rose-300 border border-white/10 transition-colors"
                title="Logout from Life Quest"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl md:hidden bg-white/5 text-slate-300 hover:text-white border border-white/10"
                aria-label="Open mobile menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0d101a] px-4 py-4 space-y-2 animate-fadeIn">
            {onOpenAddDream && (
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAddDream();
                }}
                variant="gold"
                size="md"
                className="w-full mb-3"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Inscribe New Dream
              </Button>
            )}

            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      sounds.playClick();
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 p-3 rounded-xl text-xs font-semibold border ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-glow-gold'
                        : 'bg-white/5 text-slate-300 border-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : item.highlight || ''}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 bg-[#080a0f] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono">Life Quest Private Admin System v1.2</span>
          </div>
          <p className="text-[11px] text-slate-500">
            « Push past your limits. Right here, right now. » — Black Bulls Creed
          </p>
        </div>
      </footer>
    </div>
  );
};
