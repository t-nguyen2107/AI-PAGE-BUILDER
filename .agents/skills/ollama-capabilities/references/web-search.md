# Web Search

Ollama provides web search and web fetch capabilities through its API, enabling models to access real-time information from the internet.

## API Endpoints

### Web Search

```
POST https://ollama.com/api/web_search
```

### Web Fetch

```
POST https://ollama.com/api/web_fetch
```

## Code Examples

### Web Search

```bash
curl -X POST https://ollama.com/api/web_search \
  -H "Content-Type: application/json" \
  -d '{"query": "latest Next.js 15 features"}'
```

### JavaScript (fetch) — Search

```typescript
const response = await fetch('https://ollama.com/api/web_search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'What are the new features in React 19?',
  }),
});

const results = await response.json();
console.log(results);
```

### Web Fetch

```bash
curl -X POST https://ollama.com/api/web_fetch \
  -H "Content-Type: application/json" \
  -d '{"url": "https://nextjs.org/blog"}'
```

### JavaScript (fetch) — Fetch Page

```typescript
const response = await fetch('https://ollama.com/api/web_fetch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://docs.ollama.com',
  }),
});

const pageContent = await response.json();
console.log(pageContent);
```

## MCP Server Integration

Ollama provides an MCP (Model Context Protocol) server for web search integration with AI tools:

```json
{
  "mcpServers": {
    "ollama": {
      "command": "ollama",
      "args": ["mcp"]
    }
  }
}
```

This exposes web search and web fetch as MCP tools that Claude Code and other MCP-compatible tools can use.

## Search Agent Pattern

Combine web search with Ollama's tool calling for a search agent:

```typescript
import ollama from 'ollama';

const tools = [
  {
    type: 'function',
    function: {
      name: 'web_search',
      description: 'Search the web for information',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'web_fetch',
      description: 'Fetch content from a URL',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'URL to fetch' },
        },
        required: ['url'],
      },
    },
  },
];

async function webSearch(query: string) {
  const response = await fetch('https://ollama.com/api/web_search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  return response.json();
}

async function webFetch(url: string) {
  const response = await fetch('https://ollama.com/api/web_fetch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  return response.json();
}

const toolHandlers: Record<string, (args: any) => Promise<any>> = {
  web_search: ({ query }) => webSearch(query),
  web_fetch: ({ url }) => webFetch(url),
};

// Agent loop with web search
const messages: any[] = [
  { role: 'user', content: 'What are the latest features in TypeScript 5.7?' },
];

while (true) {
  const response = await ollama.chat({
    model: 'qwen3.5',
    messages,
    tools,
  });

  messages.push(response.message);

  if (!response.message.tool_calls?.length) {
    console.log('Answer:', response.message.content);
    break;
  }

  for (const tool of response.message.tool_calls) {
    const handler = toolHandlers[tool.function.name];
    const result = await handler(tool.function.arguments);
    messages.push({
      role: 'tool',
      content: JSON.stringify(result),
    } as any);
  }
}
```

## Notes

- Web search and web fetch require internet connectivity
- These are external API calls to `ollama.com` — they are NOT local operations
- Results depend on Ollama's web search service availability
- Use web search for real-time information that the model doesn't have in its training data
- Combine with tool calling for autonomous research agents
- The MCP server is the easiest way to integrate with Claude Code
- Rate limits may apply for the hosted web search service
