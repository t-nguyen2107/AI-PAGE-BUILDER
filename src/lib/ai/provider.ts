import { ChatOllama } from '@langchain/ollama';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { resolveConfig, type AIConfig } from './config';

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
        numPredict: config.maxTokens,
      });

    case 'openai':
      return new ChatOpenAI({
        model: config.model,
        apiKey: config.apiKey,
        temperature: config.temperature,
        maxRetries: config.maxRetries,
        maxTokens: config.maxTokens,
        configuration: {
          baseURL: config.baseUrl,
        },
      });

    case 'anthropic':
      return new ChatAnthropic({
        model: config.model,
        apiKey: config.apiKey,
        temperature: config.temperature,
        maxRetries: config.maxRetries,
        maxTokens: config.maxTokens,
      });

    default:
      throw new Error(`Unknown AI provider: "${config.provider}". Use: ollama, openai, or anthropic`);
  }
}

/** Model instance + call-time options, resolved from a single config read */
export interface ModelBundle {
  model: BaseChatModel;
  jsonCallOptions: Record<string, unknown>;
}

/** Create model and JSON call options in one call (avoids double resolveConfig) */
export function createModelBundle(override?: Partial<AIConfig>): ModelBundle {
  const config = { ...resolveConfig(), ...override };
  let jsonCallOptions: Record<string, unknown> = {};

  const createForProvider = (): BaseChatModel => {
    switch (config.provider) {
      case 'ollama':
        return new ChatOllama({
          model: config.model,
          baseUrl: config.baseUrl,
          temperature: config.temperature,
          format: 'json',
          maxRetries: config.maxRetries,
          numPredict: config.maxTokens,
        });

      case 'openai':
        jsonCallOptions = { response_format: { type: 'json_object' } };
        return new ChatOpenAI({
          model: config.model,
          apiKey: config.apiKey,
          temperature: config.temperature,
          maxRetries: config.maxRetries,
          maxTokens: config.maxTokens,
          configuration: {
            baseURL: config.baseUrl,
          },
        });

      case 'anthropic':
        return new ChatAnthropic({
          model: config.model,
          apiKey: config.apiKey,
          temperature: config.temperature,
          maxRetries: config.maxRetries,
          maxTokens: config.maxTokens,
        });

      default:
        throw new Error(`Unknown AI provider: "${config.provider}". Use: ollama, openai, or anthropic`);
    }
  };

  const model = createForProvider();
  return { model, jsonCallOptions };
}
