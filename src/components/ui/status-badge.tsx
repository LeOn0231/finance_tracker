import React from 'react';
import { DreamStatus, DREAM_STATUSES } from '@/lib/types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Sparkles, Compass, Coins, Zap, CheckCircle2, Archive } from 'lucide-react';

interface StatusBadgeProps {
  status: DreamStatus | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className }) => {
  const statusKey = (status as DreamStatus) in DREAM_STATUSES ? (status as DreamStatus) : 'DREAMING';
  const item = DREAM_STATUSES[statusKey];

  const getIcon = () => {
    switch (statusKey) {
      case 'DREAMING':
        return <Sparkles className="w-3 h-3 text-indigo-400" />;
      case 'PLANNING':
        return <Compass className="w-3 h-3 text-blue-400" />;
      case 'SAVING':
        return <Coins className="w-3 h-3 text-amber-400" />;
      case 'READY_TO_BUY':
        return <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400/30 animate-pulse" />;
      case 'PURCHASED':
        return <CheckCircle2 className="w-3 h-3 text-teal-300" />;
      case 'ARCHIVED':
      default:
        return <Archive className="w-3 h-3 text-zinc-400" />;
    }
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-0.5 gap-1.5 font-medium',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center rounded-full border tracking-wide select-none backdrop-blur-md',
          item.badgeClass,
          sizeClasses[size],
          className
        )
      )}
    >
      {getIcon()}
      <span>{item.label}</span>
    </span>
  );
};
