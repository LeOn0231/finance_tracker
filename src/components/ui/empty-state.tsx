import React from 'react';
import { Button } from '@/lib/../components/ui/button';
import { Sparkles, Plus, Compass, ShieldAlert, Trophy } from 'lucide-react';

interface EmptyStateProps {
  type?: 'BIG_DREAM' | 'SMALL_DREAM' | 'PURCHASED' | 'FILTER' | 'GENERAL';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'GENERAL',
  title,
  description,
  actionLabel,
  onAction,
}) => {
  const getDetails = () => {
    switch (type) {
      case 'BIG_DREAM':
        return {
          title: title || "Your biggest quests haven't started yet.",
          quote: "« Even without magic, I will become the Wizard King. » — Asta",
          desc: description || "Inscribe your ultimate high-tier milestones into the Grimoire. Vehicles, dream setups, and legendary gear.",
          icon: <Sparkles className="w-10 h-10 text-amber-400 animate-pulse" />,
          defaultAction: 'Inscribe Big Dream',
        };
      case 'SMALL_DREAM':
        return {
          title: title || 'Every legendary collection starts with one.',
          quote: "« Push past your limits. Right here, right now. » — Yami Sukehiro",
          desc: description || 'Track everyday joys, manga volumes, audio gear, anime figures, and sleek accessories.',
          icon: <Compass className="w-10 h-10 text-purple-400" />,
          defaultAction: 'Add Small Dream',
        };
      case 'PURCHASED':
        return {
          title: title || 'The Hall of Fame awaits its first artifact.',
          quote: "« Surpass your limits and carve your legend. »",
          desc: description || 'When you achieve and acquire your dreams, their glorious victory records will be preserved here.',
          icon: <Trophy className="w-10 h-10 text-teal-400" />,
          defaultAction: 'Browse Active Quests',
        };
      case 'FILTER':
        return {
          title: title || 'No quests match your scrying filters.',
          quote: '« Change the perception coordinates. »',
          desc: description || 'Try clearing search keywords or switching priority rank tiers.',
          icon: <ShieldAlert className="w-10 h-10 text-rose-400/80" />,
          defaultAction: 'Reset Filters',
        };
      default:
        return {
          title: title || 'No quests discovered.',
          quote: '« The journey begins with a single step. »',
          desc: description || 'Start adding items to your personal tracker.',
          icon: <Sparkles className="w-10 h-10 text-amber-400" />,
          defaultAction: 'Add New Dream',
        };
    }
  };

  const config = getDetails();

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#121626]/80 to-[#0c0f18]/90 p-8 sm:p-12 text-center flex flex-col items-center justify-center backdrop-blur-xl">
      {/* Decorative aura circles */}
      <div className="absolute -top-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Center Icon badge */}
      <div className="relative mb-5 p-5 rounded-2xl bg-[#181e32]/90 border border-white/10 shadow-glow-gold flex items-center justify-center">
        {config.icon}
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-white tracking-wide mb-2 max-w-lg">
        {config.title}
      </h3>

      <div className="inline-block mb-3 px-3 py-1 rounded-full bg-amber-500/[0.08] border border-amber-500/20 text-[11px] font-medium text-amber-300 italic">
        {config.quote}
      </div>

      <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
        {config.desc}
      </p>

      {onAction && (
        <Button onClick={onAction} variant="gold" size="md">
          <Plus className="w-4 h-4 mr-1" />
          {actionLabel || config.defaultAction}
        </Button>
      )}
    </div>
  );
};
