import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { sounds } from '@/lib/sound';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gold' | 'danger' | 'ghost' | 'outline' | 'magic';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      children,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#090b10] disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-xl active:scale-[0.98]';

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-6 py-3 gap-2.5 font-semibold',
      icon: 'p-2.5 aspect-square',
    };

    const variantStyles = {
      primary:
        'bg-amber-500 hover:bg-amber-400 text-black font-semibold shadow-glow-gold hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] focus:ring-amber-400 border border-amber-400/40',
      secondary:
        'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 hover:border-slate-600 focus:ring-slate-500',
      gold:
        'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black font-bold shadow-glow-gold hover:brightness-110 focus:ring-amber-400 border border-yellow-300/40',
      magic:
        'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-semibold shadow-glow-violet hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] focus:ring-purple-400 border border-purple-400/30',
      danger:
        'bg-rose-600/90 hover:bg-rose-500 text-white shadow-glow-crimson focus:ring-rose-400 border border-rose-500/40',
      ghost:
        'bg-transparent hover:bg-white/[0.06] text-slate-300 hover:text-white focus:ring-slate-400',
      outline:
        'bg-transparent border border-white/10 hover:border-amber-500/50 text-slate-300 hover:text-amber-300 hover:bg-amber-500/[0.05] focus:ring-amber-400',
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      sounds.playClick();
      if (onClick) onClick(e);
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        onClick={handleClick}
        className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <span>Loading...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
