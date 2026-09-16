'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-white/[0.05] border border-white/[0.03] ${className}`}
    />
  );
};

export const DreamCardSkeleton: React.FC<{ variant?: 'big' | 'small' }> = ({ variant = 'big' }) => {
  if (variant === 'small') {
    return (
      <div className="rounded-2xl bg-[#121624]/60 border border-white/5 overflow-hidden p-3.5 space-y-3">
        <Skeleton className="aspect-[16/10] w-full rounded-xl" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="pt-2 border-t border-white/5 flex justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-12" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-[#121626]/60 border border-white/5 overflow-hidden p-5 space-y-4">
      <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-3 w-full" />
      </div>
      <Skeleton className="h-20 w-full rounded-2xl" />
      <div className="pt-2 flex justify-between">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
};
