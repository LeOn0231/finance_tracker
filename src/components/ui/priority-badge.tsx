import React from 'react';
import { PriorityTier, PRIORITY_TIERS } from '@/lib/types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Crown, Sparkles, Shield, Star, CircleDot } from 'lucide-react';

interface PriorityBadgeProps {
  priority: PriorityTier | string;
  size?: 'sm' | 'md' | 'lg';
  showSublabel?: boolean;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
  showSublabel = false,
  className,
}) => {
  const tierKey = (priority as PriorityTier) in PRIORITY_TIERS ? (priority as PriorityTier) : 'A_TIER';
  const tier = PRIORITY_TIERS[tierKey];

  const getIcon = () => {
    switch (tierKey) {
      case 'S_TIER':
        return <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 animate-pulse" />;
      case 'A_TIER':
        return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
      case 'B_TIER':
        return <Shield className="w-3.5 h-3.5 text-emerald-400" />;
      case 'C_TIER':
        return <Star className="w-3.5 h-3.5 text-sky-400" />;
      case 'D_TIER':
      default:
        return <CircleDot className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center rounded-lg border font-semibold tracking-wide uppercase select-none backdrop-blur-md',
          tier.badgeClass,
          sizeClasses[size],
          className
        )
      )}
    >
      {getIcon()}
      <span>{tier.label}</span>
      {showSublabel && (
        <span className="opacity-75 font-normal lowercase tracking-normal text-[11px] pl-1 border-l border-white/20">
          {tier.sublabel}
        </span>
      )}
    </span>
  );
};
