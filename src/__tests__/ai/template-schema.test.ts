import { describe, it, expect, vi } from 'vitest';
import { validateTemplateResponse } from '@/lib/ai/prompts/template-schema';

describe('validateTemplateResponse', () => {
  it('should validate a correct response', () => {
    const input = {
      components: [
        { type: 'HeroSection', props: { heading: 'Welcome' } },
        { type: 'FeaturesGrid', props: { heading: 'Features' } },
      ],
    };
    const { data, error } = validateTemplateResponse(input);
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.components).toHaveLength(2);
    expect(data!.components[0].type).toBe('HeroSection');
  });

  it('should reject non-object input', () => {
    const { data, error } = validateTemplateResponse('string');
    expect(data).toBeNull();
    expect(error).toBeTruthy();
  });

  it('should reject null input', () => {
    const { data, error } = validateTemplateResponse(null);
    expect(data).toBeNull();
    expect(error).toBeTruthy();
  });

  it('should reject missing components array', () => {
    const { data, error } = validateTemplateResponse({});
    expect(data).toBeNull();
    expect(error).toContain('components');
  });

  it('should reject empty components array', () => {
    const { data, error } = validateTemplateResponse({ components: [] });
    expect(data).toBeNull();
    expect(error).toBeTruthy();
  });

  it('should accept components with unknown types (with warning)', () => {
    const input = {
      components: [
        { type: 'UnknownType', props: {} },
      ],
    };
    const consoleWarnSpy = vi.spyOn(console, 'warn');
    const { data, error } = validateTemplateResponse(input);
    // Don't reject — just warn
    expect(data).not.toBeNull();
    expect(consoleWarnSpy).toHaveBeenCalled();
  });

  it('should normalize component without props', () => {
    const input = {
      components: [
        { type: 'HeroSection' },
      ],
    };
    const { data, error } = validateTemplateResponse(input);
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.components[0].props).toEqual({});
  });

  it('should validate full-page generation with many components', () => {
    const input = {
      components: [
        { type: 'HeaderNav', props: { logo: 'Brand' } },
        { type: 'HeroSection', props: { heading: 'Welcome' } },
        { type: 'FeaturesGrid', props: { heading: 'Features' } },
        { type: 'CTASection', props: { heading: 'CTA' } },
        { type: 'FooterSection', props: { logo: 'Brand' } },
      ],
    };
    const { data, error } = validateTemplateResponse(input);
    expect(error).toBeNull();
    expect(data!.components).toHaveLength(5);
  });
});
