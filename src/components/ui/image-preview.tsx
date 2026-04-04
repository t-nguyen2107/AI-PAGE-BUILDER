'use client';

import { cn } from '@/lib/utils';

interface ImagePreviewProps {
  src: string;
  alt?: string;
  onRemove: () => void;
  onReplace: () => void;
  compact?: boolean;
  className?: string;
}

/**
 * Shared image preview with hover overlay showing Replace/Remove actions.
 */
export function ImagePreview({
  src,
  alt = 'Preview',
  onRemove,
  onReplace,
  compact = false,
  className,
}: ImagePreviewProps) {
  return (
    <div className={cn(
      'relative rounded-lg border border-outline-variant bg-surface-lowest overflow-hidden flex items-center justify-center group',
      compact ? 'h-24' : 'h-28',
      'p-4',
      className
    )}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={cn(
          'max-h-full max-w-full object-contain',
          compact && 'w-10 h-10'
        )}
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-150 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
        <button
          type="button"
          onClick={onReplace}
          className="px-3 py-1.5 text-[11px] font-medium text-white bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 border border-white/30 transition-colors"
        >
          Replace
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="px-3 py-1.5 text-[11px] font-medium text-white bg-error/60 backdrop-blur rounded-lg hover:bg-error/80 border border-error-container/30 transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
