import { describe, it, expect } from 'vitest';
import { NodeType, DisplayType, FlexDirection, TextAlign } from '@/types';
import {
  getNodeTypeLabel,
  DISPLAY_OPTIONS,
  FLEX_DIRECTION_OPTIONS,
  JUSTIFY_OPTIONS,
  ALIGN_ITEMS_OPTIONS,
  TEXT_ALIGN_OPTIONS,
  FONT_WEIGHT_OPTIONS,
  FONT_FAMILY_OPTIONS,
  INSPECTOR_TABS_CONFIG,
} from '../constants';

// ============================================================
// getNodeTypeLabel Tests
// ============================================================
describe('getNodeTypeLabel', () => {
  it('returns "Page" for PAGE type', () => {
    expect(getNodeTypeLabel(NodeType.PAGE)).toBe('Page');
  });

  it('returns "Section" for SECTION type', () => {
    expect(getNodeTypeLabel(NodeType.SECTION)).toBe('Section');
  });

  it('returns "Container" for CONTAINER type', () => {
    expect(getNodeTypeLabel(NodeType.CONTAINER)).toBe('Container');
  });

  it('returns "Component" for COMPONENT type', () => {
    expect(getNodeTypeLabel(NodeType.COMPONENT)).toBe('Component');
  });

  it('returns "Element" for ELEMENT type', () => {
    expect(getNodeTypeLabel(NodeType.ELEMENT)).toBe('Element');
  });

  it('returns "Item" for ITEM type', () => {
    expect(getNodeTypeLabel(NodeType.ITEM)).toBe('Item');
  });
});

// ============================================================
// Option Arrays Tests
// ============================================================
describe('DISPLAY_OPTIONS', () => {
  it('includes Default as first option', () => {
    expect(DISPLAY_OPTIONS[0]).toEqual({ value: '', label: 'Default' });
  });

  it('includes Block, Flex, Grid options', () => {
    const values = DISPLAY_OPTIONS.map(o => o.value);
    expect(values).toContain(DisplayType.BLOCK);
    expect(values).toContain(DisplayType.FLEX);
    expect(values).toContain(DisplayType.GRID);
  });

  it('all options have non-empty labels', () => {
    for (const opt of DISPLAY_OPTIONS) {
      expect(opt.label.length).toBeGreaterThan(0);
    }
  });
});

describe('FLEX_DIRECTION_OPTIONS', () => {
  it('includes Row and Column', () => {
    const values = FLEX_DIRECTION_OPTIONS.map(o => o.value);
    expect(values).toContain(FlexDirection.ROW);
    expect(values).toContain(FlexDirection.COLUMN);
  });

  it('first option is Default', () => {
    expect(FLEX_DIRECTION_OPTIONS[0]).toEqual({ value: '', label: 'Default' });
  });
});

describe('JUSTIFY_OPTIONS', () => {
  it('includes center, flex-start, flex-end, space-between', () => {
    const values = JUSTIFY_OPTIONS.map(o => o.value);
    expect(values).toContain('center');
    expect(values).toContain('flex-start');
    expect(values).toContain('flex-end');
    expect(values).toContain('space-between');
  });
});

describe('ALIGN_ITEMS_OPTIONS', () => {
  it('includes center, stretch, baseline', () => {
    const values = ALIGN_ITEMS_OPTIONS.map(o => o.value);
    expect(values).toContain('center');
    expect(values).toContain('stretch');
    expect(values).toContain('baseline');
  });
});

describe('TEXT_ALIGN_OPTIONS', () => {
  it('includes Left, Center, Right, Justify', () => {
    const values = TEXT_ALIGN_OPTIONS.map(o => o.value);
    expect(values).toContain(TextAlign.LEFT);
    expect(values).toContain(TextAlign.CENTER);
    expect(values).toContain(TextAlign.RIGHT);
    expect(values).toContain(TextAlign.JUSTIFY);
  });
});

describe('FONT_WEIGHT_OPTIONS', () => {
  it('includes common weights (400, 500, 600, 700)', () => {
    const values = FONT_WEIGHT_OPTIONS.map(o => o.value);
    expect(values).toContain('400');
    expect(values).toContain('500');
    expect(values).toContain('600');
    expect(values).toContain('700');
  });
});

describe('FONT_FAMILY_OPTIONS', () => {
  it('includes Default as first option', () => {
    expect(FONT_FAMILY_OPTIONS[0]).toEqual({ value: '', label: 'Default' });
  });

  it('includes system-ui', () => {
    const values = FONT_FAMILY_OPTIONS.map(o => o.value);
    expect(values).toContain('system-ui');
  });

  it('includes Inter', () => {
    const values = FONT_FAMILY_OPTIONS.map(o => o.value);
    expect(values).toContain('Inter');
  });
});

// ============================================================
// Tab Config Tests
// ============================================================
describe('INSPECTOR_TABS_CONFIG', () => {
  it('has 6 tabs', () => {
    expect(INSPECTOR_TABS_CONFIG).toHaveLength(6);
  });

  it('contains expected tab ids', () => {
    const ids = INSPECTOR_TABS_CONFIG.map(t => t.id);
    expect(ids).toEqual(['layout', 'spacing', 'background', 'typography', 'content', 'seo']);
  });

  it('all tabs have non-empty labels', () => {
    for (const tab of INSPECTOR_TABS_CONFIG) {
      expect(tab.label.length).toBeGreaterThan(0);
    }
  });

  it('all tab ids are unique', () => {
    const ids = INSPECTOR_TABS_CONFIG.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
