'use client';

import { useBuilderStore } from '@/store';
import type { DOMNode, SectionNode } from '@/types';
import { Input, Select } from '@/components/ui/input';
import { useDebouncedCallback } from '../constants';

export interface BackgroundTabProps {
  node: DOMNode;
}

export function BackgroundTab({ node }: BackgroundTabProps) {
  const updateNode = useBuilderStore((s) => s.updateNode);

  const bg = node.type === 'section'
    ? (node as SectionNode).background ?? {}
    : {};
  const inlineStyles = 'inlineStyles' in node
    ? ((node as unknown as Record<string, unknown>).inlineStyles as Record<string, string>) ?? {}
    : {};

  const debouncedUpdateBg = useDebouncedCallback(
    (key: string, value: string) => {
      const newBg = { ...bg, [key]: value || undefined };
      Object.keys(newBg).forEach((k) => {
        if (newBg[k as keyof typeof newBg] === undefined) delete newBg[k as keyof typeof newBg];
      });
      updateNode(node.id, { background: newBg } as Partial<DOMNode>);
    },
    300
  );

  const debouncedUpdateInline = useDebouncedCallback(
    (key: string, value: string) => {
      const newStyles = { ...inlineStyles, [key]: value || undefined };
      Object.keys(newStyles).forEach((k) => {
        if (newStyles[k] === undefined) delete newStyles[k];
      });
      updateNode(node.id, { inlineStyles: newStyles } as Partial<DOMNode>);
    },
    300
  );

  return (
    <div className="p-3 space-y-3">
      {node.type !== 'section' && (
        <p className="text-xs text-on-surface-variant">Background color applies via inline styles for this node type.</p>
      )}

      <Input
        label="Background Color"
        value={bg.color ?? inlineStyles.backgroundColor ?? ''}
        onChange={(e) => debouncedUpdateBg('color', e.target.value)}
        placeholder="#ffffff or transparent"
      />

      <div className="flex items-center gap-2">
        <input
          type="color"
          value={bg.color ?? inlineStyles.backgroundColor ?? '#000000'}
          onChange={(e) => debouncedUpdateBg('color', e.target.value)}
          className="w-10 h-8 rounded-lg cursor-pointer bg-transparent"
          style={{ border: '1px solid color-mix(in srgb, var(--outline-variant) 20%, transparent)' }}
          title="Pick color"
        />
        <span className="text-xs text-on-surface-variant mt-1">Pick color</span>
      </div>

      {node.type === 'section' && (
        <>
          <Input
            label="Gradient"
            value={bg.gradient ?? ''}
            onChange={(e) => debouncedUpdateBg('gradient', e.target.value)}
            placeholder="linear-gradient(135deg, #667eea, #764ba2)"
          />

          <Input
            label="Background Image URL"
            value={bg.imageUrl ?? ''}
            onChange={(e) => debouncedUpdateBg('imageUrl', e.target.value)}
            placeholder="https://..."
          />
        </>
      )}

      <Input
        label="Border Color"
        value={inlineStyles.borderColor ?? ''}
        onChange={(e) => debouncedUpdateInline('borderColor', e.target.value)}
        placeholder="#e5e7eb"
      />

      <Select
        label="Border Style"
        value={inlineStyles.borderStyle ?? ''}
        onChange={(e) => debouncedUpdateInline('borderStyle', e.target.value)}
        options={[
          { value: '', label: 'None' },
          { value: 'solid', label: 'Solid' },
          { value: 'dashed', label: 'Dashed' },
          { value: 'dotted', label: 'Dotted' },
        ]}
      />

      <Input
        label="Border Width"
        value={inlineStyles.borderWidth ?? ''}
        onChange={(e) => debouncedUpdateInline('borderWidth', e.target.value)}
        placeholder="1px"
      />
    </div>
  );
}
