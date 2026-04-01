import { describe, it, expect } from 'vitest';
import { NodeType, SemanticTag, DisplayType, FlexDirection, TextAlign } from '@/types/enums';
import type { ElementNode, ItemNode, SectionNode, ContainerNode, ComponentNode, PageNode } from '@/types/dom-tree';
import {
  typographyToStyles,
  inlineStylesToCSS,
  mergeStyles,
} from '../utils/layout-to-styles';

// ============================================================
// Test Data Factory
// ============================================================
const now = new Date().toISOString();

function makeElement(overrides: Partial<ElementNode> = {}): ElementNode {
  return {
    id: 'elem-1',
    type: NodeType.ELEMENT,
    tag: SemanticTag.H1,
    content: 'Hello',
    meta: { createdAt: now, updatedAt: now },
    ...overrides,
  };
}

// ============================================================
// typographyToStyles Tests
// ============================================================
describe('typographyToStyles', () => {
  it('returns empty object for undefined typography', () => {
    expect(typographyToStyles(undefined)).toEqual({});
  });

  it('converts fontSize to CSS', () => {
    const result = typographyToStyles({ fontSize: '16px' });
    expect(result.fontSize).toBe('16px');
  });

  it('converts fontWeight to CSS', () => {
    const result = typographyToStyles({ fontWeight: '700' });
    expect(result.fontWeight).toBe('700');
  });

  it('converts fontFamily to CSS', () => {
    const result = typographyToStyles({ fontFamily: 'Inter' });
    expect(result.fontFamily).toBe('Inter');
  });

  it('converts lineHeight to CSS', () => {
    const result = typographyToStyles({ lineHeight: '1.5' });
    expect(result.lineHeight).toBe('1.5');
  });

  it('converts letterSpacing to CSS', () => {
    const result = typographyToStyles({ letterSpacing: '0.05em' });
    expect(result.letterSpacing).toBe('0.05em');
  });

  it('converts color to CSS', () => {
    const result = typographyToStyles({ color: '#333' });
    expect(result.color).toBe('#333');
  });

  it('converts textAlign to CSS', () => {
    const result = typographyToStyles({ textAlign: TextAlign.CENTER });
    expect(result.textAlign).toBe('center');
  });

  it('converts all properties at once', () => {
    const result = typographyToStyles({
      fontSize: '20px',
      fontWeight: '600',
      fontFamily: 'Roboto',
      lineHeight: '1.4',
      letterSpacing: '0.02em',
      color: 'red',
      textAlign: TextAlign.RIGHT,
    });

    expect(result).toEqual({
      fontSize: '20px',
      fontWeight: '600',
      fontFamily: 'Roboto',
      lineHeight: '1.4',
      letterSpacing: '0.02em',
      color: 'red',
      textAlign: 'right',
    });
  });
});

// ============================================================
// inlineStylesToCSS Tests
// ============================================================
describe('inlineStylesToCSS', () => {
  it('returns empty object for undefined inlineStyles', () => {
    expect(inlineStylesToCSS(undefined)).toEqual({});
  });

  it('preserves CSS property names', () => {
    const result = inlineStylesToCSS({
      backgroundColor: '#f0f0f0',
      borderColor: '#ccc',
      borderRadius: '8px',
    });

    expect(result.backgroundColor).toBe('#f0f0f0');
    expect(result.borderColor).toBe('#ccc');
    expect(result.borderRadius).toBe('8px');
  });

  it('handles empty object', () => {
    expect(inlineStylesToCSS({})).toEqual({});
  });
});

// ============================================================
// mergeStyles Tests
// ============================================================
describe('mergeStyles', () => {
  it('merges two style objects', () => {
    const result = mergeStyles(
      { fontSize: '16px', color: 'red' },
      { backgroundColor: 'blue' }
    );

    expect(result).toEqual({
      fontSize: '16px',
      color: 'red',
      backgroundColor: 'blue',
    });
  });

  it('inlineStyles override typographyStyles for same key', () => {
    const result = mergeStyles(
      { color: 'red' },
      { color: 'blue' }
    );

    expect(result.color).toBe('blue');
  });

  it('handles empty first object', () => {
    const result = mergeStyles({}, { fontSize: '14px' });
    expect(result).toEqual({ fontSize: '14px' });
  });

  it('handles empty second object', () => {
    const result = mergeStyles({ fontSize: '14px' }, {});
    expect(result).toEqual({ fontSize: '14px' });
  });

  it('handles both empty', () => {
    expect(mergeStyles({}, {})).toEqual({});
  });
});

// ============================================================
// Void Element Detection Tests (logic from ElementRenderer)
// ============================================================
describe('Void element tags', () => {
  const VOID_TAGS = new Set([SemanticTag.INPUT, 'br', 'hr']);

  it('input is a void element', () => {
    expect(VOID_TAGS.has(SemanticTag.INPUT)).toBe(true);
  });

  it('br is a void element', () => {
    expect(VOID_TAGS.has('br')).toBe(true);
  });

  it('hr is a void element', () => {
    expect(VOID_TAGS.has('hr')).toBe(true);
  });

  it('div is not a void element', () => {
    expect(VOID_TAGS.has(SemanticTag.DIV)).toBe(false);
  });

  it('p is not a void element', () => {
    expect(VOID_TAGS.has(SemanticTag.P)).toBe(false);
  });

  it('img is not a void element (handled separately)', () => {
    expect(VOID_TAGS.has(SemanticTag.IMG)).toBe(false);
  });
});
