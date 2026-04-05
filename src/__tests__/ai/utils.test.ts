/// <reference types="vitest/globals" />
import { stripEmojis, safeJsonParse } from '@/lib/ai/utils';

describe('stripEmojis', () => {
  it('should strip common emojis', () => {
    expect(stripEmojis('Hello 🎉 World 🚀')).toBe('Hello World');
  });

  it('should strip emoji skin tone modifiers', () => {
    expect(stripEmojis('👍🏽 thumbs up')).toBe('thumbs up');
  });

  it('should strip flag emojis', () => {
    expect(stripEmojis('🇻🇬 Vietnam')).toBe('Vietnam');
  });

  it('should collapse multiple spaces after stripping', () => {
    expect(stripEmojis('A 🎉 🚀 B')).toBe('A B');
  });

  it('should trim leading/trailing spaces', () => {
    expect(stripEmojis(' 🎉 hello 🎉 ')).toBe('hello');
  });

  it('should return unchanged text without emojis', () => {
    expect(stripEmojis('No emojis here')).toBe('No emojis here');
  });

  it('should handle empty string', () => {
    expect(stripEmojis('')).toBe('');
  });
});

describe('safeJsonParse', () => {
  it('should parse valid JSON', () => {
    const result = safeJsonParse('{"key":"value"}');
    expect(result).toEqual({ key: 'value' });
  });

  it('should return fallback for invalid JSON', () => {
    const fallback = { default: true };
    expect(safeJsonParse('not json', fallback)).toBe(fallback);
  });

  it('should return fallback for null/undefined input', () => {
    const fallback = {};
    expect(safeJsonParse(null, fallback)).toBe(fallback);
    expect(safeJsonParse(undefined, fallback)).toBe(fallback);
  });

  it('should return default empty object when no fallback provided', () => {
    expect(safeJsonParse('invalid')).toEqual({});
  });

  it('should parse arrays', () => {
    const result = safeJsonParse('[1,2,3]');
    expect(result).toEqual([1, 2, 3]);
  });
});
