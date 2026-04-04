'use client';

import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface DropZoneProps {
  label: string;
  onBrowse: () => void;
  onFileSelect: (url: string) => void;
  projectId: string;
  accept?: string;
  compact?: boolean;
}

/**
 * Shared drag-and-drop file upload zone.
 * Supports drag-and-drop with fallback to file input.
 */
export function DropZone({
  label,
  onBrowse,
  onFileSelect,
  projectId,
  accept = 'image/*',
  compact = false,
}: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);
    try {
      const res = await fetch('/api/media/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success && data.data?.url) {
        onFileSelect(data.data.url);
      }
    } catch {
      // Silent fail — user can use Browse instead
    }
  };

  return (
    <div
      className={cn(
        'rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-150',
        compact ? 'h-24' : 'h-28',
        dragging
          ? 'border-primary bg-primary/5'
          : 'border-outline-variant bg-surface-container/50 hover:border-primary/50 hover:bg-primary/5'
      )}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
    >
      <span className="material-symbols-outlined text-3xl text-on-surface-outline">
        cloud_upload
      </span>
      <span className="text-xs text-on-surface-outline">{label}</span>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onBrowse(); }}
        className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
      >
        or browse files
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
