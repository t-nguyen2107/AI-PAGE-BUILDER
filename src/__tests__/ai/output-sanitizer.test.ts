import { describe, it, expect } from 'vitest';
import { sanitizeAIResponse } from '@/lib/ai/output-sanitizer';

describe('sanitizeAIResponse', () => {
  it('should strip emojis from top-level message', () => {
    const result = sanitizeAIResponse({ message: 'Hello 🎉 world 🌍!' });
    expect(result.message).toBe('Hello world !');
  });

  it('should sanitize components array with unique IDs', () => {
    const result = sanitizeAIResponse({
      components: [
        { type: 'HeroSection', props: { id: 'dup' } },
        { type: 'HeroSection', props: { id: 'dup' } },
      ],
    });
    const comps = result.components as Array<{ props: { id: string } }>;
    expect(comps[0].props.id).toBe('dup');
    expect(comps[1].props.id).toBe('dup_1');
    expect(comps[0].props.id).not.toBe(comps[1].props.id);
  });

  it('should generate ID for components missing id', () => {
    const result = sanitizeAIResponse({
      components: [{ type: 'TextBlock', props: {} }],
    });
    const comps = result.components as Array<{ props: { id: string } }>;
    expect(comps[0].props.id).toMatch(/^comp_\d+_\d+$/);
  });

  it('should generate ID when props.id is non-string', () => {
    const result = sanitizeAIResponse({
      components: [{ type: 'TextBlock', props: { id: 123 } }],
    });
    const comps = result.components as Array<{ props: { id: string } }>;
    expect(typeof comps[0].props.id).toBe('string');
  });

  it('should strip emojis from component text props', () => {
    const result = sanitizeAIResponse({
      components: [{
        type: 'HeroSection',
        props: { id: 'h1', heading: 'Welcome 🚀', subtext: 'Build 🎯 something' },
      }],
    });
    const comps = result.components as Array<{ props: Record<string, unknown> }>;
    expect(comps[0].props.heading).toBe('Welcome');
    expect(comps[0].props.subtext).toBe('Build something');
  });

  it('should fill missing props with defaults', () => {
    const result = sanitizeAIResponse({
      components: [{ type: 'HeroSection', props: { id: 'h1' } }],
    });
    const props = (result.components as Array<{ props: Record<string, unknown> }>)[0].props;
    expect(props.heading).toBe('Welcome to Our Website');
    expect(props.ctaText).toBe('Get Started');
    expect(props.align).toBe('center');
  });

  it('should not overwrite existing valid props with defaults', () => {
    const result = sanitizeAIResponse({
      components: [{
        type: 'HeroSection',
        props: { id: 'h1', heading: 'My Custom Heading', ctaText: 'Click Here' },
      }],
    });
    const props = (result.components as Array<{ props: Record<string, unknown> }>)[0].props;
    expect(props.heading).toBe('My Custom Heading');
    expect(props.ctaText).toBe('Click Here');
  });

  it('should coerce string columns to number for FeaturesGrid', () => {
    const result = sanitizeAIResponse({
      components: [{
        type: 'FeaturesGrid',
        props: { id: 'f1', columns: '4' },
      }],
    });
    const props = (result.components as Array<{ props: Record<string, unknown> }>)[0].props;
    expect(props.columns).toBe(4);
  });

  it('should coerce string height to number for Spacer', () => {
    const result = sanitizeAIResponse({
      components: [{ type: 'Spacer', props: { id: 's1', height: '64' } }],
    });
    const props = (result.components as Array<{ props: Record<string, unknown> }>)[0].props;
    expect(props.height).toBe(64);
  });

  it('should coerce string columns/gap to number for ColumnsLayout', () => {
    const result = sanitizeAIResponse({
      components: [{ type: 'ColumnsLayout', props: { id: 'c1', columns: '3', gap: '32' } }],
    });
    const props = (result.components as Array<{ props: Record<string, unknown> }>)[0].props;
    expect(props.columns).toBe(3);
    expect(props.gap).toBe(32);
  });

  it('should keep empty string as type (valid string)', () => {
    const result = sanitizeAIResponse({
      components: [{ type: '', props: { id: 'x1' } }],
    });
    const comps = result.components as Array<{ type: string }>;
    expect(comps[0].type).toBe('');
  });

  it('should fallback to TextBlock when type is not a string', () => {
    const result = sanitizeAIResponse({
      components: [{ type: 42, props: { id: 'x1' } }],
    });
    const comps = result.components as Array<{ type: string }>;
    expect(comps[0].type).toBe('TextBlock');
  });

  it('should set _legacyNodes flag when nodes field is used', () => {
    const result = sanitizeAIResponse({
      nodes: [{ type: 'HeroSection', props: { id: 'h1' } }],
    });
    expect(result._legacyNodes).toBe(true);
    expect(result.components).toBeUndefined();
  });

  it('should auto-generate name when missing', () => {
    const result = sanitizeAIResponse({
      components: [{
        type: 'HeroSection',
        props: { id: 'h1', heading: 'Welcome' },
      }],
    });
    const props = (result.components as Array<{ props: Record<string, unknown> }>)[0].props;
    expect(props.name).toBeDefined();
    expect(typeof props.name).toBe('string');
    expect((props.name as string).length).toBeGreaterThan(0);
  });

  it('should pass through non-object components unchanged', () => {
    const result = sanitizeAIResponse({
      components: [null, 'bad', 42],
    });
    const comps = result.components as unknown[];
    expect(comps).toHaveLength(3);
  });
});
