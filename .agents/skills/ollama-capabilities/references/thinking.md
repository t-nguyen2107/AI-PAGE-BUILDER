# Thinking / Reasoning

Ollama supports thinking/reasoning mode where models expose their internal reasoning process. This produces a `thinking` trace alongside the final `content`.

## API Parameter

```
think: true
```

## Supported Models

Not all models support thinking. Known supported models:

- **Qwen 3** (all sizes) — includes `<think/>` tags in output
- **GPT-OSS** — thinking mode
- **DeepSeek-R1** — reasoning model
- **Other thinking-capable models** — check model card

## Response Structure

When thinking is enabled, the response includes both `thinking` and `content`:

```json
{
  "message": {
    "role": "assistant",
    "thinking": "Let me reason through this step by step...\nFirst, I need to consider...",
    "content": "The answer is 42."
  }
}
```

## Code Examples

### JavaScript (SDK)

```typescript
import ollama from 'ollama';

const response = await ollama.chat({
  model: 'qwen3.5',
  messages: [{ role: 'user', content: 'Explain quantum computing simply' }],
  think: true,
});

console.log('Thinking:', response.message.thinking);
console.log('Answer:', response.message.content);
```

### JavaScript (Streaming)

```typescript
import ollama from 'ollama';

const response = await ollama.chat({
  model: 'qwen3.5',
  messages: [{ role: 'user', content: 'Solve: if x+5=12, what is x?' }],
  think: true,
  stream: true,
});

let thinking = '';
let content = '';

for await (const chunk of response) {
  if (chunk.message.thinking) {
    thinking += chunk.message.thinking;
  }
  if (chunk.message.content) {
    content += chunk.message.content;
  }
}

console.log('Reasoning:', thinking);
console.log('Answer:', content);
```

### Python

```python
import ollama

response = ollama.chat(
    model='qwen3.5',
    messages=[{'role': 'user', 'content': 'Is 97 a prime number?'}],
    think=True,
)

print('Thinking:', response['message']['thinking'])
print('Answer:', response['message']['content'])
```

### Python (Streaming)

```python
import ollama

stream = ollama.chat(
    model='qwen3.5',
    messages=[{'role': 'user', 'content': 'Is 97 a prime number?'}],
    think=True,
    stream=True,
)

for chunk in stream:
    if thinking := chunk['message'].get('thinking'):
        print(thinking, end='', flush=True)
    if content := chunk['message'].get('content'):
        print(content, end='', flush=True)
```

### cURL

```bash
curl http://localhost:11434/api/chat -d '{
  "model": "qwen3.5",
  "messages": [{"role": "user", "content": "What is 15% of 200?"}],
  "think": true
}'
```

## Parsing `<think/>` Tags

Some models (like Qwen 3 without explicit `think` parameter) may include `<think/>` tags in their content. Always strip these when processing raw model output:

```typescript
function stripThinkTags(text: string): string {
  return text.replace(/<think\b[^>]*>[\s\S]*?<\/think>/gi, '').trim();
}
```

## Use Cases

- **Debug AI reasoning**: See how the model arrived at its answer
- **UI display**: Show a "thinking" section in chat interfaces
- **Quality validation**: Verify the model's reasoning before trusting its output
- **Educational**: Help users understand the reasoning process

## Notes

- Thinking increases token count and response time — the model generates reasoning tokens before the answer
- The `thinking` field may be `null` or empty for models that don't support it
- When `think: true` is used with a non-thinking model, the parameter is silently ignored
- Thinking content is NOT included in subsequent context — it's for display/audit only
