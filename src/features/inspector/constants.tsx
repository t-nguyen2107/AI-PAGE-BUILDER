'use client';

import React, { useCallback, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { DisplayType, FlexDirection, TextAlign, NodeType } from '@/types';

// ============================================================
// Debounce hook
// ============================================================
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((...args: any[]) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callbackRef.current(...args), delay);
    }) as T,
    [delay]
  );
}

// ============================================================
// Option arrays
// ============================================================

export const DISPLAY_OPTIONS = [
  { value: '', label: 'Default' },
  { value: DisplayType.BLOCK, label: 'Block' },
  { value: DisplayType.FLEX, label: 'Flex' },
  { value: DisplayType.GRID, label: 'Grid' },
  { value: DisplayType.INLINE, label: 'Inline' },
  { value: DisplayType.INLINE_BLOCK, label: 'Inline Block' },
];

export const FLEX_DIRECTION_OPTIONS = [
  { value: '', label: 'Default' },
  { value: FlexDirection.ROW, label: 'Row' },
  { value: FlexDirection.COLUMN, label: 'Column' },
  { value: FlexDirection.ROW_REVERSE, label: 'Row Reverse' },
  { value: FlexDirection.COLUMN_REVERSE, label: 'Column Reverse' },
];

export const JUSTIFY_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'flex-start', label: 'Start' },
  { value: 'center', label: 'Center' },
  { value: 'flex-end', label: 'End' },
  { value: 'space-between', label: 'Space Between' },
  { value: 'space-around', label: 'Space Around' },
  { value: 'space-evenly', label: 'Space Evenly' },
];

export const ALIGN_ITEMS_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'flex-start', label: 'Start' },
  { value: 'center', label: 'Center' },
  { value: 'flex-end', label: 'End' },
  { value: 'stretch', label: 'Stretch' },
  { value: 'baseline', label: 'Baseline' },
];

export const TEXT_ALIGN_OPTIONS = [
  { value: '', label: 'Default' },
  { value: TextAlign.LEFT, label: 'Left' },
  { value: TextAlign.CENTER, label: 'Center' },
  { value: TextAlign.RIGHT, label: 'Right' },
  { value: TextAlign.JUSTIFY, label: 'Justify' },
];

export const FONT_WEIGHT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: '100', label: 'Thin (100)' },
  { value: '200', label: 'Extra Light (200)' },
  { value: '300', label: 'Light (300)' },
  { value: '400', label: 'Regular (400)' },
  { value: '500', label: 'Medium (500)' },
  { value: '600', label: 'Semi Bold (600)' },
  { value: '700', label: 'Bold (700)' },
  { value: '800', label: 'Extra Bold (800)' },
  { value: '900', label: 'Black (900)' },
];

export const FONT_FAMILY_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'var(--font-geist-sans)', label: 'Geist Sans' },
  { value: 'var(--font-geist-mono)', label: 'Geist Mono' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Inter', label: 'Inter' },
  { value: 'system-ui', label: 'System UI' },
];

// ============================================================
// Helper functions
// ============================================================

export function getNodeTypeLabel(type: NodeType): string {
  switch (type) {
    case NodeType.PAGE: return 'Page';
    case NodeType.SECTION: return 'Section';
    case NodeType.CONTAINER: return 'Container';
    case NodeType.COMPONENT: return 'Component';
    case NodeType.ELEMENT: return 'Element';
    case NodeType.ITEM: return 'Item';
    default: return 'Node';
  }
}

// ============================================================
// Layout field helper component
// ============================================================
export function LayoutField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <Input
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
    />
  );
}

// ============================================================
// Tab configuration
// ============================================================
export const INSPECTOR_TABS_CONFIG = [
  { id: 'layout', label: 'Layout' },
  { id: 'spacing', label: 'Spacing' },
  { id: 'background', label: 'Background' },
  { id: 'typography', label: 'Typography' },
  { id: 'content', label: 'Content' },
  { id: 'seo', label: 'SEO' },
];
