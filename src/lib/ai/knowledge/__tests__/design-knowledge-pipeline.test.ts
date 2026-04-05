/**
 * Integration test: Design Knowledge Pipeline — verify end-to-end knowledge lookup.
 *
 * Tests:
 * 1. resolveDesignGuidance for common business types
 * 2. formatDesignGuidance produces prompt-injectable text
 * 3. generateStyleguideFromBusinessType produces valid styleguide
 * 4. isDefaultStyleguide detection
 * 5. Prompt optimizer detects business type and returns design context
 */

import { describe, it, expect } from 'vitest';
import { DEFAULT_COLORS, PROJECT_ROUTE_DEFAULT_PRIMARY } from '@/lib/constants';
import {
  resolveDesignGuidance,
  formatDesignGuidance,
} from '../../knowledge/design-knowledge';
import {
  generateStyleguideFromBusinessType,
  isDefaultStyleguide,
} from '../../knowledge/auto-styleguide';
import { optimizePrompt } from '../../prompts/prompt-optimizer';

// ─── 1. Design Knowledge Lookup ─────────────────────────────────────────────

describe('resolveDesignGuidance', () => {
  it('resolves guidance for restaurant/dining', () => {
    const guidance = resolveDesignGuidance('restaurant/dining');
    expect(guidance).not.toBeNull();
    expect(guidance!.colorPalette.primary).toBe('#DC2626');
    expect(guidance!.reasoning).toBeDefined();
    expect(guidance!.typography).toBeDefined();
  });

  it('resolves guidance for SaaS/technology', () => {
    const guidance = resolveDesignGuidance('SaaS/technology');
    expect(guidance).not.toBeNull();
    expect(guidance!.colorPalette.primary).toBe('#2563EB');
  });

  it('resolves guidance for fitness/gym', () => {
    const guidance = resolveDesignGuidance('fitness/gym');
    expect(guidance).not.toBeNull();
    expect(guidance!.colorPalette.primary).toBe('#F97316');
    expect(guidance!.reasoning.keyEffects).toBeDefined();
  });

  it('returns null for unknown business type', () => {
    const guidance = resolveDesignGuidance('nonexistent_business');
    expect(guidance).toBeNull();
  });
});

// ─── 2. Format Design Guidance ──────────────────────────────────────────────

describe('formatDesignGuidance', () => {
  it('produces formatted text for prompt injection', () => {
    const guidance = resolveDesignGuidance('bakery/pastry shop');
    const text = formatDesignGuidance(guidance!);
    expect(text).toContain('primary=');
    expect(text).toContain('Colors:');
    expect(text).toContain('Typography:');
    expect(text).toContain('Layout:');
    expect(text.length).toBeGreaterThan(100);
  });
});

// ─── 3. Auto-Styleguide Generation ──────────────────────────────────────────

describe('generateStyleguideFromBusinessType', () => {
  it('generates styleguide for restaurant/dining', () => {
    const result = generateStyleguideFromBusinessType('restaurant/dining');
    expect(result).not.toBeNull();
    expect(result!.generated).toBe(true);
    expect(result!.businessType).toBe('restaurant/dining');
    expect(result!.styleguide.colors.primary).toBe('#DC2626');
    expect(result!.styleguide.colors.surface).toBe('#FFFFFF'); // card → surface
    expect(result!.styleguide.colors.text).toBe('#450A0A');     // foreground → text
    expect(result!.styleguide.typography.headingFont).toContain(', sans-serif');
    expect(result!.styleguide.cssVariables['--color-primary']).toBe('#DC2626');
  });

  it('generates styleguide for e-commerce/store', () => {
    const result = generateStyleguideFromBusinessType('e-commerce/store');
    expect(result).not.toBeNull();
    expect(result!.styleguide.colors.primary).toBe('#059669');
    expect(result!.styleguide.cssVariables['--color-primary']).toBe('#059669');
  });

  it('returns null for unknown business type', () => {
    const result = generateStyleguideFromBusinessType('unknown_type_xyz');
    expect(result).toBeNull();
  });

  it('includes CSS variables for all color tokens', () => {
    const result = generateStyleguideFromBusinessType('SaaS/technology');
    expect(result).not.toBeNull();
    const vars = result!.styleguide.cssVariables;
    expect(vars['--color-primary']).toBeDefined();
    expect(vars['--color-secondary']).toBeDefined();
    expect(vars['--color-accent']).toBeDefined();
    expect(vars['--color-background']).toBeDefined();
    expect(vars['--color-surface']).toBeDefined();
    expect(vars['--color-text']).toBeDefined();
    expect(vars['--color-text-muted']).toBeDefined();
    expect(vars['--color-border']).toBeDefined();
    expect(vars['--font-heading']).toBeDefined();
    expect(vars['--font-body']).toBeDefined();
  });
});

// ─── 4. isDefaultStyleguide ─────────────────────────────────────────────────

describe('isDefaultStyleguide', () => {
  it('detects default styleguide (from constants.ts)', () => {
    expect(isDefaultStyleguide({ primary: DEFAULT_COLORS.primary })).toBe(true);
  });

  it('detects default styleguide (from projects route)', () => {
    expect(isDefaultStyleguide({ primary: PROJECT_ROUTE_DEFAULT_PRIMARY })).toBe(true);
  });

  it('detects custom styleguide', () => {
    expect(isDefaultStyleguide({ primary: '#DC2626' })).toBe(false);
  });
});

// ─── 5. Prompt Optimizer Integration ────────────────────────────────────────

describe('optimizePrompt with design knowledge', () => {
  it('detects restaurant business type from Vietnamese prompt', () => {
    const { businessType, designContext } = optimizePrompt('Tạo trang web cho nhà hàng');
    expect(businessType).toBeTruthy();
    if (designContext) {
      expect(designContext.length).toBeGreaterThan(50);
    }
  });

  it('detects SaaS business type', () => {
    const { businessType, designContext } = optimizePrompt('Create a landing page for my SaaS product');
    expect(businessType).toBeTruthy();
    if (designContext) {
      expect(designContext).toContain('primary=');
    }
  });

  it('detects bakery business type', () => {
    const { businessType, designContext } = optimizePrompt('Tạo trang cho tiệm bánh ngọt');
    expect(businessType).toBeTruthy();
    if (designContext) {
      expect(designContext.length).toBeGreaterThan(50);
    }
  });

  it('detects fitness business type', () => {
    const { businessType, designContext } = optimizePrompt('Build a fitness gym landing page');
    expect(businessType).toBeTruthy();
    if (designContext) {
      expect(designContext).toContain('primary=');
    }
  });
});
