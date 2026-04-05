/// <reference types="vitest/globals" />
import { resolveConfig } from '@/lib/ai/config';

// Save and restore env vars
const originalEnv = { ...process.env };

describe('resolveConfig', () => {
  afterEach(() => {
    // Restore original env
    process.env = { ...originalEnv };
  });

  it('should return defaults when no env vars set', () => {
    delete process.env.AI_PROVIDER;
    delete process.env.AI_MODEL;
    delete process.env.AI_BASE_URL;
    delete process.env.AI_TEMPERATURE;
    delete process.env.AI_MAX_RETRIES;
    delete process.env.AI_MAX_TOKENS;
    delete process.env.OLLAMA_BASE_URL;
    delete process.env.OLLAMA_MODEL;

    const config = resolveConfig();
    expect(config.provider).toBe('ollama');
    expect(config.model).toBe('qwen3.5');
    expect(config.temperature).toBe(0.7);
    expect(config.maxRetries).toBe(2);
    expect(config.maxTokens).toBe(16384);
  });

  it('should use OpenAI provider when set', () => {
    process.env.AI_PROVIDER = 'openai';
    process.env.AI_MODEL = 'gpt-4';
    process.env.AI_BASE_URL = 'https://api.openai.com/v1';
    process.env.AI_TEMPERATURE = '0.5';
    process.env.AI_MAX_RETRIES = '3';
    process.env.AI_MAX_TOKENS = '4096';

    const config = resolveConfig();
    expect(config.provider).toBe('openai');
    expect(config.model).toBe('gpt-4');
    expect(config.baseUrl).toBe('https://api.openai.com/v1');
    expect(config.temperature).toBe(0.5);
    expect(config.maxRetries).toBe(3);
    expect(config.maxTokens).toBe(4096);
  });

  it('should clamp out-of-bounds temperature to valid range', () => {
    process.env.AI_PROVIDER = 'ollama';
    process.env.AI_TEMPERATURE = '5.0';
    const consoleWarnSpy = vi.spyOn(console, 'warn');

    const config = resolveConfig();
    expect(config.temperature).toBe(0.7); // falls back to default
    expect(consoleWarnSpy).toHaveBeenCalled();
  });

  it('should clamp negative temperature to default', () => {
    process.env.AI_PROVIDER = 'ollama';
    process.env.AI_TEMPERATURE = '-1';
    const consoleWarnSpy = vi.spyOn(console, 'warn');

    const config = resolveConfig();
    expect(config.temperature).toBe(0.7); // falls back to default
    expect(consoleWarnSpy).toHaveBeenCalled();
  });

  it('should clamp maxRetries above 10 to default', () => {
    process.env.AI_PROVIDER = 'ollama';
    process.env.AI_MAX_RETRIES = '100';
    const consoleWarnSpy = vi.spyOn(console, 'warn');

    const config = resolveConfig();
    expect(config.maxRetries).toBe(2); // default
    expect(consoleWarnSpy).toHaveBeenCalled();
  });

  it('should clamp maxTokens above 65536 to default', () => {
    process.env.AI_PROVIDER = 'ollama';
    process.env.AI_MAX_TOKENS = '999999';
    const consoleWarnSpy = vi.spyOn(console, 'warn');

    const config = resolveConfig();
    expect(config.maxTokens).toBe(16384); // default
    expect(consoleWarnSpy).toHaveBeenCalled();
  });

  it('should handle NaN temperature gracefully', () => {
    process.env.AI_PROVIDER = 'ollama';
    process.env.AI_TEMPERATURE = 'abc';
    const consoleWarnSpy = vi.spyOn(console, 'warn');

    const config = resolveConfig();
    expect(config.temperature).toBe(0.7); // default
    expect(consoleWarnSpy).toHaveBeenCalled();
  });

  it('should warn about deprecated OLLAMA_BASE_URL', () => {
    process.env.OLLAMA_BASE_URL = 'http://custom:11434';
    delete process.env.AI_BASE_URL;
    const consoleWarnSpy = vi.spyOn(console, 'warn');

    resolveConfig();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('OLLAMA_BASE_URL is deprecated'),
    );
  });

  it('should warn about deprecated OLLAMA_MODEL', () => {
    process.env.OLLAMA_MODEL = 'llama3';
    delete process.env.AI_MODEL;
    const consoleWarnSpy = vi.spyOn(console, 'warn');

    resolveConfig();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('OLLAMA_MODEL is deprecated'),
    );
  });
});
