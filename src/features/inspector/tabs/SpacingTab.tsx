'use client';

import type { DOMNode, LayoutProperties, SectionNode, ContainerNode, ComponentNode } from '@/types';
import { Input } from '@/components/ui/input';
import { LayoutField } from '../constants';

export interface SpacingTabProps {
  node: DOMNode;
  onUpdateLayout: (key: keyof LayoutProperties, value: string) => void;
}

export function SpacingTab({
  node,
  onUpdateLayout,
}: SpacingTabProps) {
  const layout: LayoutProperties =
    'layout' in node ? (node as SectionNode | ContainerNode | ComponentNode).layout ?? {} : {};

  return (
    <div className="flex flex-col gap-3 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
        Padding
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Input
          label="Top"
          value={layout.padding?.split(' ')?.[0] ?? ''}
          onChange={(e) => {
            const parts = layout.padding?.split(' ') ?? ['', '', '', ''];
            parts[0] = e.target.value;
            onUpdateLayout('padding', parts.join(' '));
          }}
          placeholder="0px"
        />
        <Input
          label="Right"
          value={layout.padding?.split(' ')?.[1] ?? ''}
          onChange={(e) => {
            const parts = layout.padding?.split(' ') ?? ['', '', '', ''];
            parts[1] = e.target.value;
            onUpdateLayout('padding', parts.join(' '));
          }}
          placeholder="0px"
        />
        <Input
          label="Bottom"
          value={layout.padding?.split(' ')?.[2] ?? ''}
          onChange={(e) => {
            const parts = layout.padding?.split(' ') ?? ['', '', '', ''];
            parts[2] = e.target.value;
            onUpdateLayout('padding', parts.join(' '));
          }}
          placeholder="0px"
        />
        <Input
          label="Left"
          value={layout.padding?.split(' ')?.[3] ?? ''}
          onChange={(e) => {
            const parts = layout.padding?.split(' ') ?? ['', '', '', ''];
            parts[3] = e.target.value;
            onUpdateLayout('padding', parts.join(' '));
          }}
          placeholder="0px"
        />
      </div>

      <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant mt-2 mb-1">
        Margin
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Input
          label="Top"
          value={layout.margin?.split(' ')?.[0] ?? ''}
          onChange={(e) => {
            const parts = layout.margin?.split(' ') ?? ['', '', '', ''];
            parts[0] = e.target.value;
            onUpdateLayout('margin', parts.join(' '));
          }}
          placeholder="0px"
        />
        <Input
          label="Right"
          value={layout.margin?.split(' ')?.[1] ?? ''}
          onChange={(e) => {
            const parts = layout.margin?.split(' ') ?? ['', '', '', ''];
            parts[1] = e.target.value;
            onUpdateLayout('margin', parts.join(' '));
          }}
          placeholder="0px"
        />
        <Input
          label="Bottom"
          value={layout.margin?.split(' ')?.[2] ?? ''}
          onChange={(e) => {
            const parts = layout.margin?.split(' ') ?? ['', '', '', ''];
            parts[2] = e.target.value;
            onUpdateLayout('margin', parts.join(' '));
          }}
          placeholder="0px"
        />
        <Input
          label="Left"
          value={layout.margin?.split(' ')?.[3] ?? ''}
          onChange={(e) => {
            const parts = layout.margin?.split(' ') ?? ['', '', '', ''];
            parts[3] = e.target.value;
            onUpdateLayout('margin', parts.join(' '));
          }}
          placeholder="0px"
        />
      </div>

      <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant mt-2 mb-1">
        Dimensions
      </p>
      <div className="grid grid-cols-2 gap-2">
        <LayoutField
          label="Width"
          value={layout.width ?? ''}
          onChange={(v) => onUpdateLayout('width', v)}
          placeholder="auto"
        />
        <LayoutField
          label="Height"
          value={layout.height ?? ''}
          onChange={(v) => onUpdateLayout('height', v)}
          placeholder="auto"
        />
        <LayoutField
          label="Max Width"
          value={layout.maxWidth ?? ''}
          onChange={(v) => onUpdateLayout('maxWidth', v)}
          placeholder="none"
        />
        <LayoutField
          label="Min Height"
          value={layout.minHeight ?? ''}
          onChange={(v) => onUpdateLayout('minHeight', v)}
          placeholder="0"
        />
      </div>

      <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant mt-2 mb-1">
        Border
      </p>
      <Input
        label="Border Radius"
        value={layout.borderRadius ?? ''}
        onChange={(e) => onUpdateLayout('borderRadius', e.target.value)}
        placeholder="e.g. 8px"
      />
    </div>
  );
}
