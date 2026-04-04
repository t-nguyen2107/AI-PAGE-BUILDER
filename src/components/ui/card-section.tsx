'use client';

import { cn } from '@/lib/utils';

interface CardSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Shared section card used across settings tabs.
 * White rounded card with title header and content area.
 */
export function CardSection({ title, description, children, className }: CardSectionProps) {
  return (
    <div className={cn(
      'bg-surface-lowest rounded-xl border border-outline-variant shadow-sm',
      className
    )}>
      <div className="px-5 py-3.5 border-b border-outline-variant/50">
        <h3 className="text-xs font-semibold text-on-surface">{title}</h3>
        {description && (
          <p className="text-[11px] text-on-surface-outline mt-0.5">{description}</p>
        )}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}
