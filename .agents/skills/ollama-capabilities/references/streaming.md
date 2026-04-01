# Streaming

Ollama supports streaming responses for both `/api/chat` and `/api/generate` endpoints, delivering tokens in real-time as they are generated.

## API Parameter

```
stream: true
```

## How It Works

When `stream: true` is set, the API returns newline-delimited JSON (NDJSON). Each chunk is a JSON object followed by a newline. The final chunk has `"done": true`.

## Chunk Structure

Each streaming chunk contains:

```json
{
  "model": "qwen3.5",
  "created_at": "2024-01-01T00:00:00Z",
  "message": {
    "role": "assistant",
    "content": "token text here"
  },
  "done": false
}
```

Final chunk:

```json
{
  "model": "qwen3.5",
  "created_at": "2024-01-01T00:00:00Z",
  "message": { "role": "assistant", "content": "" },
  "done": true,
  "total_duration": 5000000000,
  "load_duration": 50000000,
  "prompt_eval_count": 26,
  "prompt_eval_duration": 400000000,
  "eval_count": 282,
  "eval_duration": 4500000000
}
```

## Code Examples

### JavaScript (SDK)

```typescript
import ollama from 'ollama';

const response = await ollama.chat({
  model: 'qwen3.5',
  messages: [{ role: 'user', content: 'Write a haiku' }],
  stream: true,
});

for await (const chunk of response) {
  process.stdout.write(chunk.message.content);
}
```

### JavaScript (fetch)

```typescript
const response = await fetch('http://localhost:11434/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    model: 'qwen3.5',
    messages: [{ role: 'user', content: 'Write a haiku' }],
    stream: true,
  }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const text = decoder.decode(value);
  const lines = text.split('\n').filter(Boolean);

  for (const line of lines) {
    const chunk = JSON.parse(line);
    if (chunk.done) break;
    process.stdout.write(chunk.message.content);
  }
}
```

### Python

```python
import ollama

stream = ollama.chat(
    model='qwen3.5',
    messages=[{'role': 'user', 'content': 'Write a haiku'}],
    stream=True,
)

for chunk in stream:
    print(chunk['message']['content'], end='', flush=True)
```

### cURL

```bash
curl http://localhost:11434/api/chat -d '{
  "model": "qwen3.5",
  "messages": [{"role": "user", "content": "Write a haiku"}],
  "stream": true
}'
```

## Streaming with Thinking

When `think: true` is enabled alongside streaming, chunks include a `thinking` field:

```typescript
for await (const chunk of response) {
  if (chunk.message.thinking) {
    // Reasoning trace tokens
    process.stdout.write(chunk.message.thinking);
  }
  if (chunk.message.content) {
    // Final answer tokens
    process.stdout.write(chunk.message.content);
  }
}
```

## Streaming with Tool Calls

Tool calls can also stream. Chunks contain `tool_calls` with incremental function name and arguments:

```typescript
for await (const chunk of response) {
  if (chunk.message.tool_calls) {
    for (const tool of chunk.message.tool_calls) {
      console.log(`Tool: ${tool.function.name}`);
      console.log(`Args: ${tool.function.arguments}`);
    }
  }
}
```

## Non-Streaming (Default)

Without `stream: true`, the API waits until the full response is complete before returning a single JSON object. This is simpler but has higher time-to-first-token latency.

## Performance Notes

- Streaming reduces perceived latency — users see tokens immediately
- Use streaming for interactive chat UIs
- For batch processing or when you need the complete response before acting, use non-streaming
- Streaming does NOT reduce total generation time, only improves perceived responsiveness
