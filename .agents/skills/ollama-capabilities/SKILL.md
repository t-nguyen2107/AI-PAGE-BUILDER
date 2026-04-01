---
name: ollama-capabilities
description: Ollama API capabilities reference covering streaming, thinking, structured outputs, vision, embeddings, tool calling, and web search. Use when integrating Ollama into applications, configuring AI features, or working with local LLM capabilities. Triggers on "ollama", "streaming", "think", "structured output", "vision", "embeddings", "tool calling", "web search", "local LLM".
license: MIT
metadata:
  author: ollama
  version: "1.0.0"
---

# Ollama Capabilities Reference

Complete reference for all Ollama API capabilities. This skill provides guidance on using Ollama's local LLM features including streaming, thinking, structured outputs, vision, embeddings, tool calling, and web search.

## When to Apply

Reference this skill when:
- Setting up AI generation with Ollama (`http://localhost:11434/api/`)
- Implementing streaming responses for chat/generation
- Using thinking/reasoning models (Qwen 3, DeepSeek)
- Enforcing structured JSON output from models
- Processing images with vision models
- Generating text embeddings for search/similarity
- Building tool-calling / function-calling agents
- Integrating web search capabilities

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Streaming | HIGH | `stream` |
| 2 | Thinking | HIGH | `think` |
| 3 | Structured Outputs | HIGH | `format` |
| 4 | Vision | MEDIUM | `images` |
| 5 | Tool Calling | HIGH | `tools` |
| 6 | Embeddings | MEDIUM | `embed` |
| 7 | Web Search | MEDIUM | `web_search` |

## Capability Overview

| Category | API Parameter | Purpose |
|----------|--------------|---------|
| Streaming | `stream: true` | Real-time chunk-by-token response delivery |
| Thinking | `think: true` | Enable model reasoning/thinking traces |
| Structured Outputs | `format` | Enforce JSON schema on model output |
| Vision | `images` array | Process images alongside text prompts |
| Tool Calling | `tools` array | Function calling with multi-turn agent loops |
| Embeddings | `/api/embed` | Generate vector embeddings for text |
| Web Search | `ollama.com/api/web_search` | Search the web via Ollama API |

## Quick Reference

### Base URL & SDK

```
API Base: http://localhost:11434/api/
JS SDK:   import ollama from 'ollama'
Python:   import ollama
cURL:     curl http://localhost:11434/api/chat
```

### Streaming (Default)

```typescript
// JS SDK - streaming
const response = await ollama.chat({
  model: 'qwen3.5',
  messages: [{ role: 'user', content: 'Hello' }],
  stream: true,
});

for await (const chunk of response) {
  process.stdout.write(chunk.message.content);
}
```

### Thinking / Reasoning

```typescript
const response = await ollama.chat({
  model: 'qwen3.5',
  messages: [{ role: 'user', content: 'Explain recursion' }],
  think: true,  // Enable thinking
});

// response.message.thinking — reasoning trace
// response.message.content — final answer
```

Supported models: Qwen 3, GPT-OSS, DeepSeek-R1, and other thinking models.

### Structured Outputs

```typescript
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const Schema = z.object({
  name: z.string(),
  items: z.array(z.string()),
});

const response = await ollama.chat({
  model: 'qwen3.5',
  messages: [{ role: 'user', content: 'List 3 fruits' }],
  format: zodToJsonSchema(Schema),  // JSON Schema object
});

const parsed = Schema.parse(JSON.parse(response.message.content));
```

### Vision

```typescript
const response = await ollama.chat({
  model: 'llava',
  messages: [{
    role: 'user',
    content: 'Describe this image',
    images: ['./photo.jpg'],  // File path, URL, or base64
  }],
});
```

### Tool Calling

```typescript
const response = await ollama.chat({
  model: 'qwen3.5',
  messages: [{ role: 'user', content: 'What is 2+2?' }],
  tools: [{
    type: 'function',
    function: {
      name: 'add',
      description: 'Add two numbers',
      parameters: {
        type: 'object',
        properties: {
          a: { type: 'number' },
          b: { type: 'number' },
        },
        required: ['a', 'b'],
      },
    },
  }],
});

// response.message.tool_calls — array of tool calls
```

### Embeddings

```typescript
const response = await ollama.embed({
  model: 'nomic-embed-text',
  input: ['Hello world', 'Goodbye world'],
});

// response.embeddings — array of float arrays
```

### Web Search

```bash
# Search the web
curl -X POST https://ollama.com/api/web_search \
  -d '{"query": "latest Next.js features"}'

# Fetch a webpage
curl -X POST https://ollama.com/api/web_fetch \
  -d '{"url": "https://nextjs.org/blog"}'
```

## Rule Files

See individual rule files for detailed capability documentation:

```
references/streaming.md          - Streaming responses
references/thinking.md           - Thinking/reasoning mode
references/structured-outputs.md - Structured JSON output
references/vision.md             - Image/vision processing
references/embeddings.md         - Text embeddings
references/tool-calling.md       - Function/tool calling
references/web-search.md         - Web search integration
```

## How to Use

Use the capability categories above for navigation, then open the specific reference file you need. Each reference file contains detailed API parameters, code examples in multiple languages, and edge cases.
