'use client';

import type { DOMNode, TypographyProperties, ElementNode, ItemNode } from '@/types';
import { NodeType } from '@/types';
import { Select, Input } from '@/components/ui/input';
import { FONT_FAMILY_OPTIONS, FONT_WEIGHT_OPTIONS, TEXT_ALIGN_OPTIONS } from '../constants';

export interface TypographyTabProps {
  node: DOMNode;
  onUpdateTypography: (key: keyof TypographyProperties, value: string) => void;
}

export function TypographyTab({
  node,
  onUpdateTypography,
}: TypographyTabProps) {
  const typography: TypographyProperties =
    'typography' in node ? (node as ElementNode | ItemNode).typography ?? {} : {};

  return (
    <div className="flex flex-col gap-3 p-3">
      <Select
        label="Font Family"
        value={typography.fontFamily ?? ''}
        options={FONT_FAMILY_OPTIONS}
        onChange={(e) => onUpdateTypography('fontFamily', e.target.value)}
      />
      <Input
        label="Font Size"
        value={typography.fontSize ?? ''}
        onChange={(e) => onUpdateTypography('fontSize', e.target.value)}
        placeholder="e.g. 16px, 1.5rem"
      />
      <Select
        label="Font Weight"
        value={typography.fontWeight ?? ''}
        options={FONT_WEIGHT_OPTIONS}
        onChange={(e) => onUpdateTypography('fontWeight', e.target.value)}
      />
      <Input
        label="Line Height"
        value={typography.lineHeight ?? ''}
        onChange={(e) => onUpdateTypography('lineHeight', e.target.value)}
        placeholder="e.g. 1.5"
      />
      <Input
        label="Letter Spacing"
        value={typography.letterSpacing ?? ''}
        onChange={(e) => onUpdateTypography('letterSpacing', e.target.value)}
        placeholder="e.g. 0.05em"
      />
      <Select
        label="Text Align"
        value={typography.textAlign ?? ''}
        options={TEXT_ALIGN_OPTIONS}
        onChange={(e) => onUpdateTypography('textAlign', e.target.value)}
      />
      <Input
        label="Color"
        value={typography.color ?? ''}
        onChange={(e) => onUpdateTypography('color', e.target.value)}
        placeholder="#000000"
      />
    </div>
  );
}
