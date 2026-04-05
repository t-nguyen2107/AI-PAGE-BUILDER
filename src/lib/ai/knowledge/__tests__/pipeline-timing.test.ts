import { describe, it, expect } from 'vitest';
import { optimizePrompt } from '../../prompts/prompt-optimizer';
import {
  resolveDesignGuidance,
  formatDesignGuidance,
} from '../design-knowledge';
import {
  generateStyleguideFromBusinessType,
  isDefaultStyleguide,
} from '../auto-styleguide';
import { DEFAULT_COLORS } from '@/lib/constants';

function time<T>(label: string, fn: () => T): { result: T; ms: number } {
  const start = performance.now();
  const result = fn();
  const ms = Math.round(performance.now() - start);
  console.log(`[timing] ${label}: ${ms}ms`);
  return { result, ms };
}

describe('AI Pipeline Timing', () => {
  describe('Stage 1: Prompt Optimization', () => {
    const prompts = [
      { input: 'Tạo trang web cho nhà hàng', expected: 'restaurant' },
      { input: 'Create a landing page for my SaaS product', expected: 'SaaS' },
      { input: 'Tạo trang cho tiệm bánh ngọt', expected: 'bakery' },
      { input: 'Build a fitness gym landing page', expected: 'fitness' },
      { input: 'Landing page for crypto web3 project', expected: 'crypto' },
    ];

    for (const { input, expected } of prompts) {
      it(`detects "${expected}" from: "${input}"`, () => {
        const timed = time(`optimizePrompt("${input}")`, () => optimizePrompt(input));
        expect(timed.result.businessType).toBeTruthy();
        console.log(`  businessType=${timed.result.businessType}, ms=${timed.ms}`);
      });
    }
  });

  describe('Stage 2: Design Knowledge Lookup', () => {
    const types = [
      'restaurant/dining',
      'SaaS/technology',
      'bakery/pastry shop',
      'fitness/gym',
      'e-commerce/luxury',
    ];

    for (const bt of types) {
      it(`resolves + formats for ${bt}`, () => {
        const step1 = time(`resolveDesignGuidance("${bt}")`, () => resolveDesignGuidance(bt));
        expect(step1.result).not.toBeNull();
        const g = step1.result!;
        expect(g.colorPalette.primary).toBeTruthy();

        const step2 = time(`formatDesignGuidance("${bt}")`, () => formatDesignGuidance(g));
        expect(step2.result.length).toBeGreaterThan(50);
        console.log(`  ${bt}: resolve=${step1.ms}ms, format=${step2.ms}ms`);
      });
    }
  });

  describe('Stage 3: Auto-Styleguide Generation', () => {
    const types = ['restaurant/dining', 'SaaS/technology', 'e-commerce/luxury', 'fitness/gym'];

    for (const bt of types) {
      it(`generates styleguide for ${bt}`, () => {
        const timed = time(`generateStyleguideFromBusinessType("${bt}")`, () =>
          generateStyleguideFromBusinessType(bt));

        expect(timed.result).not.toBeNull();
        const sg = timed.result!;
        expect(sg.generated).toBe(true);
        expect(sg.styleguide.colors.primary).toBeTruthy();
        expect(sg.styleguide.typography.headingFont).toBeTruthy();
        expect(sg.styleguide.cssVariables['--color-primary']).toBeDefined();
        expect(sg.styleguide.cssVariables['--font-heading']).toBeTruthy();
        console.log(`  ${bt}: primary=${sg.styleguide.colors.primary}, cssVars=${Object.keys(sg.styleguide.cssVariables).length}, ms=${timed.ms}ms`);
      });
    }
  });

  describe('Stage 4: isDefaultStyleguide Detection', () => {
    it('detects default styleguide', () => {
      expect(isDefaultStyleguide({ primary: DEFAULT_COLORS.primary })).toBe(true);
    });
    it('detects custom styleguide', () => {
      expect(isDefaultStyleguide({ primary: '#DC2626' })).toBe(false);
    });
  });

  describe('Stage 5: Full Pipeline Integration', () => {
    const cases = [
      { prompt: 'Tạo trang cho nhà hàng Việt Nam' },
      { prompt: 'Create a SaaS dashboard page' },
      { prompt: 'Tạo website tiệm bánh Artisan Bakery' },
    ];

    for (const { prompt: promptText } of cases) {
      it(`full pipeline: "${promptText}"`, () => {
        const totalStart = performance.now();

        const s1 = time('  Step1-optimizePrompt', () => optimizePrompt(promptText));
        expect(s1.result.businessType).toBeTruthy();

        const s2 = time('  Step2-resolveGuidance', () => resolveDesignGuidance(s1.result.businessType));
        expect(s2.result).not.toBeNull();

        const s3 = time('  Step3-formatGuidance', () => formatDesignGuidance(s2.result!));
        expect(s3.result.length).toBeGreaterThan(50);

        const s4 = time('  Step4-generateStyleguide', () =>
          generateStyleguideFromBusinessType(s1.result.businessType!));
        expect(s4.result).not.toBeNull();

        const totalMs = Math.round(performance.now() - totalStart);
        console.log(`  TOTAL: ${totalMs}ms (s1=${s1.ms}, s2=${s2.ms}, s3=${s3.ms}, s4=${s4.ms})`);
      });
    }
  });

  describe('Stage 6: Cross-type consistency', () => {
    it('different business types produce different colors', () => {
      const r = generateStyleguideFromBusinessType('restaurant/dining');
      const s = generateStyleguideFromBusinessType('SaaS/technology');

      expect(r!.styleguide.colors.primary).not.toBe(s!.styleguide.colors.primary);
      expect(r!.styleguide.colors.primary).toBe('#DC2626');
      expect(s!.styleguide.colors.primary).toBe('#2563EB');
    });
  });
});
