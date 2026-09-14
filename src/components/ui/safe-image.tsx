'use client';

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Sparkles, Package, Shield, Car, Laptop, Headphones, BookOpen, Shirt, Watch, Camera } from 'lucide-react';

interface SafeImageProps {
  src?: string | null;
  alt: string;
  category?: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  category = 'General',
  className,
  containerClassName,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getCategoryIcon = () => {
    const cat = category.toLowerCase();
    if (cat.includes('vehicle') || cat.includes('car') || cat.includes('bike')) return <Car className="w-8 h-8 text-amber-400/60" />;
    if (cat.includes('elect') || cat.includes('pc') || cat.includes('laptop')) return <Laptop className="w-8 h-8 text-cyan-400/60" />;
    if (cat.includes('audio') || cat.includes('headphone') || cat.includes('sound')) return <Headphones className="w-8 h-8 text-purple-400/60" />;
    if (cat.includes('manga') || cat.includes('book')) return <BookOpen className="w-8 h-8 text-emerald-400/60" />;
    if (cat.includes('fashion') || cat.includes('shoe') || cat.includes('cloth')) return <Shirt className="w-8 h-8 text-rose-400/60" />;
    if (cat.includes('watch') || cat.includes('jewel')) return <Watch className="w-8 h-8 text-amber-400/60" />;
    if (cat.includes('camera') || cat.includes('gear')) return <Camera className="w-8 h-8 text-indigo-400/60" />;
    if (cat.includes('anime') || cat.includes('figure') || cat.includes('collect')) return <Sparkles className="w-8 h-8 text-amber-400/60" />;
    return <Package className="w-8 h-8 text-slate-500" />;
  };

  const showFallback = !src || hasError;

  return (
    <div
      className={twMerge(
        clsx(
          'relative overflow-hidden bg-gradient-to-br from-[#121624] to-[#0c0f18] flex items-center justify-center select-none',
          containerClassName
        )
      )}
    >
      {showFallback ? (
        <div className="w-full h-full min-h-[140px] flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-slate-900/90 via-[#101424] to-slate-950 border border-white/5">
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 mb-2 shadow-inner">
            {getCategoryIcon()}
          </div>
          <span className="text-xs font-semibold text-slate-400 line-clamp-1 max-w-[85%]">{alt}</span>
          <span className="text-[10px] text-amber-500/70 font-mono mt-0.5 tracking-wider uppercase">
            {category}
          </span>
        </div>
      ) : (
        <>
          {isLoading && (
            <div className="absolute inset-0 bg-slate-900/60 animate-pulse flex items-center justify-center z-10">
              <div className="w-6 h-6 border-2 border-amber-500/40 border-t-amber-400 rounded-full animate-spin" />
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setHasError(true);
              setIsLoading(false);
            }}
            className={twMerge(
              clsx(
                'w-full h-full object-cover transition-all duration-500',
                isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100',
                className
              )
            )}
          />
        </>
      )}
    </div>
  );
};
