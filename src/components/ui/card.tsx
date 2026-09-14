import React, { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'gold' | 'interactive';
  glow?: 'none' | 'gold' | 'violet' | 'crimson' | 'emerald';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'glass', glow = 'none', children, ...props }, ref) => {
    const baseStyles = 'rounded-2xl transition-all duration-300 relative overflow-hidden';

    const variantStyles = {
      default: 'bg-surface-card border border-surface-border text-slate-100',
      elevated: 'bg-surface-elevated border border-white/[0.12] text-slate-100 shadow-xl',
      glass: 'glass-panel text-slate-100',
      gold: 'glass-panel-gold text-slate-100',
      interactive:
        'glass-panel text-slate-100 hover:border-amber-500/40 hover:bg-surface-elevated/90 hover:shadow-card-hover group cursor-pointer',
    };

    const glowStyles = {
      none: '',
      gold: 'shadow-glow-gold border-amber-500/40',
      violet: 'shadow-glow-violet border-purple-500/40',
      crimson: 'shadow-glow-crimson border-rose-500/40',
      emerald: 'shadow-glow-emerald border-emerald-500/40',
    };

    return (
      <div
        ref={ref}
        className={twMerge(clsx(baseStyles, variantStyles[variant], glowStyles[glow], className))}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
