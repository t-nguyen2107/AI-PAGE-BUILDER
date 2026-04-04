'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-surface-container',
        className
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-16/10 rounded-xl" />
      <Skeleton className="h-4 w-2/3 rounded" />
      <Skeleton className="h-3 w-1/3 rounded" />
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4 rounded', i === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  );
}
