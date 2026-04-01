'use client';

import type { DOMNode, LayoutProperties, SectionNode, ContainerNode, ComponentNode } from '@/types';
import { DisplayType, FlexDirection } from '@/types';
import { Select, Input } from '@/components/ui/input';
import { DISPLAY_OPTIONS, FLEX_DIRECTION_OPTIONS, JUSTIFY_OPTIONS, ALIGN_ITEMS_OPTIONS } from '../constants';

export interface LayoutTabProps {
  node: DOMNode;
  onUpdateLayout: (key: keyof LayoutProperties, value: string) => void;
}

export function LayoutTab({
  node,
  onUpdateLayout,
}: LayoutTabProps) {
  const layout: LayoutProperties =
    'layout' in node ? (node as SectionNode | ContainerNode | ComponentNode).layout ?? {} : {};

  return (
    <div className="flex flex-col gap-3 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
        Display
      </p>
      <Select
        label="Display"
        value={layout.display ?? ''}
        options={DISPLAY_OPTIONS}
        onChange={(e) => onUpdateLayout('display', e.target.value)}
      />

      {(layout.display === DisplayType.FLEX || !layout.display) && (
        <>
          <Select
            label="Flex Direction"
            value={layout.flexDirection ?? ''}
            options={FLEX_DIRECTION_OPTIONS}
            onChange={(e) => onUpdateLayout('flexDirection', e.target.value)}
          />
          <Select
            label="Justify Content"
            value={layout.justifyContent ?? ''}
            options={JUSTIFY_OPTIONS}
            onChange={(e) => onUpdateLayout('justifyContent', e.target.value)}
          />
          <Select
            label="Align Items"
            value={layout.alignItems ?? ''}
            options={ALIGN_ITEMS_OPTIONS}
            onChange={(e) => onUpdateLayout('alignItems', e.target.value)}
          />
          <Input
            label="Gap"
            value={layout.gap ?? ''}
            onChange={(e) => onUpdateLayout('gap', e.target.value)}
            placeholder="e.g. 16px, 1rem"
          />
        </>
      )}

      {layout.display === DisplayType.GRID && (
        <>
          <Input
            label="Grid Columns"
            value={layout.gridTemplateColumns ?? ''}
            onChange={(e) => onUpdateLayout('gridTemplateColumns', e.target.value)}
            placeholder="e.g. 1fr 1fr 1fr"
          />
          <Input
            label="Grid Rows"
            value={layout.gridTemplateRows ?? ''}
            onChange={(e) => onUpdateLayout('gridTemplateRows', e.target.value)}
            placeholder="e.g. auto auto"
          />
          <Input
            label="Gap"
            value={layout.gap ?? ''}
            onChange={(e) => onUpdateLayout('gap', e.target.value)}
            placeholder="e.g. 16px, 1rem"
          />
        </>
      )}
    </div>
  );
}
