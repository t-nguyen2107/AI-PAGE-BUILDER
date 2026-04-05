import { describe, it, expect } from 'vitest';
import { isVietnamese, extractComponentTypes } from '@/lib/ai/session-analyzer';

describe('isVietnamese', () => {
  it('should detect Vietnamese text with diacritical marks', () => {
    expect(isVietnamese('Xin chào bạn')).toBe(true);
  });

  it('should detect Vietnamese with tones', () => {
    expect(isVietnamese('Tiệm bánh ngọt')).toBe(true);
  });

  it('should return false for English text', () => {
    expect(isVietnamese('Hello world')).toBe(false);
  });

  it('should return false for single Vietnamese mark', () => {
    // Needs at least 2 marks
    expect(isVietnamese('One à only')).toBe(false);
  });

  it('should return true for text with 2+ Vietnamese marks', () => {
    expect(isVietnamese('Cà phê sữa đá')).toBe(true);
  });

  it('should return false for empty string', () => {
    expect(isVietnamese('')).toBe(false);
  });
});

describe('extractComponentTypes', () => {
  it('should extract component types from JSON response', () => {
    const json = '{"components": [{"type": "HeroSection"}, {"type": "FeaturesGrid"}]}';
    const types = extractComponentTypes(json);
    expect(types).toEqual(['HeroSection', 'FeaturesGrid']);
  });

  it('should extract from multiple occurrences', () => {
    const json = '{"type": "HeroSection"} and {"type": "CTASection"}';
    const types = extractComponentTypes(json);
    expect(types).toEqual(['HeroSection', 'CTASection']);
  });

  it('should return empty array for no matches', () => {
    const json = '{"message": "hello"}';
    const types = extractComponentTypes(json);
    expect(types).toEqual([]);
  });

  it('should extract all valid types from a full response', () => {
    const json = `
      {"type": "HeaderNav"}
      {"type": "HeroSection"}
      {"type": "FeaturesGrid"}
      {"type": "CTASection"}
      {"type": "FooterSection"}
    `;
    const types = extractComponentTypes(json);
    expect(types).toEqual([
      'HeaderNav', 'HeroSection', 'FeaturesGrid', 'CTASection', 'FooterSection',
    ]);
  });
});
