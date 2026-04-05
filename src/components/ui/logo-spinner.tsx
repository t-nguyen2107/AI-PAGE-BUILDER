'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoSpinnerProps {
  size?: number;
  className?: string;
  text?: string;
}

export function LogoSpinner({ size = 40, className, text }: LogoSpinnerProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3', className)}
      role="status"
      aria-live="polite"
    >
      <div
        className="relative animate-spin rounded-lg"
        style={{ width: size, height: size, animationDuration: '1.5s' }}
      >
        <Image
          src="/assets/images/fav.png"
          alt=""
          width={size}
          height={size}
          className="rounded-sm"
          priority
        />
      </div>
      {text && (
        <p className="text-sm text-on-surface-variant animate-pulse">{text}</p>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
