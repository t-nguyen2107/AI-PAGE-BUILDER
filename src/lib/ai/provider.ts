import { ChatOllama } from '@langchain/ollama';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { resolveConfig, type AIProvider, type AIConfig } from './config';

/**
 * Create a chat model instance based on the configured provider.
 * Provider is determined by AI_PROVIDER env var (default: "ollama").
 */
export function createModel(override?: Partial<AIConfig>): BaseChatModel {
  const config = { ...resolveConfig(), ...override };

  switch (config.provider) {
    case 'ollama':
      return new ChatOllama({
        model: config.model,
        baseUrl: config.baseUrl,
        temperature: config.temperature,
        format: 'json',
        maxRetries: config.maxRetries,
      });

    case 'openai':
      return new ChatOpenAI({
        model: config.model,
        apiKey: config.apiKey,
        temperature: config.temperature,
        maxRetries: config.maxRetries,
      });

    case 'anthropic':
      return new ChatAnthropic({
        model: config.model,
        apiKey: config.apiKey,
        temperature: config.temperature,
        maxRetries: config.maxRetries,
      });

    default:
      throw new Error(`Unknown AI provider: "${config.provider}". Use: ollama, openai, or anthropic`);
  }
}
