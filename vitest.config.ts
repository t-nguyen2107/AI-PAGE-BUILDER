import { defineConfig } from 'vitest/config';
import path from 'path';
import { config as dotenvConfig } from 'dotenv';

// Load .env.local for E2E tests (embedding, LLM API calls)
dotenvConfig({ path: path.resolve(__dirname, '.env.local') });

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: [],
    pool: 'forks',
    // Load .env.local so E2E tests can access real API keys.
    // Unit tests are unaffected — they don't call external APIs.
    env: {
      AI_PROVIDER: process.env.AI_PROVIDER ?? '',
      AI_BASE_URL: process.env.AI_BASE_URL ?? '',
      AI_MODEL: process.env.AI_MODEL ?? '',
      AI_API_KEY: process.env.AI_API_KEY ?? '',
      AI_TEMPERATURE: process.env.AI_TEMPERATURE ?? '',
      AI_MAX_TOKENS: process.env.AI_MAX_TOKENS ?? '',
      EMBEDDING_PROVIDER: process.env.EMBEDDING_PROVIDER ?? '',
      EMBEDDING_BASE_URL: process.env.EMBEDDING_BASE_URL ?? '',
      EMBEDDING_API_KEY: process.env.EMBEDDING_API_KEY ?? '',
      EMBEDDING_MODEL: process.env.EMBEDDING_MODEL ?? '',
      EMBEDDING_DIMENSIONS: process.env.EMBEDDING_DIMENSIONS ?? '',
      DATABASE_URL: process.env.DATABASE_URL ?? '',
      DATABASE_DIRECT_URL: process.env.DATABASE_DIRECT_URL ?? '',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
