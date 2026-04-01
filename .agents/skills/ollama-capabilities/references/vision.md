# Vision

Ollama supports vision capabilities, allowing models to process and analyze images alongside text prompts.

## API Parameter

Add `images` array to user messages:

```typescript
messages: [{
  role: 'user',
  content: 'Describe this image',
  images: ['<image data>'],  // File path, URL, base64, or Uint8Array
}]
```

## Image Input Formats

Ollama accepts images in multiple formats:

| Format | Example | Notes |
|--------|---------|-------|
| File path | `'./photo.jpg'` | JS SDK resolves automatically |
| URL | `'https://example.com/image.jpg'` | Fetched by Ollama server |
| Base64 string | `'/9j/4AAQ...'` | Raw base64 without data URI prefix |
| Uint8Array | `new Uint8Array(buffer)` | Raw bytes (JS SDK only) |

## Supported Models

Vision-capable models include:

- **llava** — General vision-language model
- **llava-llama3** — LLaVA with Llama 3 backbone
- **bakllava** — BakLlava vision model
- **minicpm-v** — Efficient vision model
- **llama3.2-vision** — Llama 3.2 with vision
- **gemma3** — Gemma 3 with vision support

Check `ollama list` for available vision models.

## Code Examples

### JavaScript (SDK) — File Path

```typescript
import ollama from 'ollama';

const response = await ollama.chat({
  model: 'llava',
  messages: [{
    role: 'user',
    content: 'What is in this image?',
    images: ['./photo.jpg'],
  }],
});

console.log(response.message.content);
```

### JavaScript (SDK) — Multiple Images

```typescript
const response = await ollama.chat({
  model: 'llava',
  messages: [{
    role: 'user',
    content: 'Compare these two images and describe the differences',
    images: ['./image1.jpg', './image2.jpg'],
  }],
});
```

### JavaScript — Base64 Image

```typescript
import fs from 'fs';

const imageBuffer = fs.readFileSync('./photo.jpg');
const base64Image = imageBuffer.toString('base64');

const response = await fetch('http://localhost:11434/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    model: 'llava',
    messages: [{
      role: 'user',
      content: 'Describe this image',
      images: [base64Image],
    }],
  }),
});

const data = await response.json();
console.log(data.message.content);
```

### Python — File Path

```python
import ollama

response = ollama.chat(
    model='llava',
    messages=[{
        'role': 'user',
        'content': 'Describe what you see',
        'images': ['./photo.jpg'],
    }],
)

print(response['message']['content'])
```

### Python — Base64

```python
import base64
import ollama

with open('photo.jpg', 'rb') as f:
    image_base64 = base64.b64encode(f.read()).decode('utf-8')

response = ollama.chat(
    model='llava',
    messages=[{
        'role': 'user',
        'content': 'What colors are in this image?',
        'images': [image_base64],
    }],
)
```

### cURL

```bash
# With base64 image
curl http://localhost:11434/api/chat -d '{
  "model": "llava",
  "messages": [{
    "role": "user",
    "content": "Describe this image",
    "images": ["'"$(base64 -w0 photo.jpg)"'"]
  }]
}'
```

## Streaming with Vision

Vision works with streaming just like text-only chat:

```typescript
const response = await ollama.chat({
  model: 'llava',
  messages: [{
    role: 'user',
    content: 'Describe this image in detail',
    images: ['./photo.jpg'],
  }],
  stream: true,
});

for await (const chunk of response) {
  process.stdout.write(chunk.message.content);
}
```

## Multi-Turn Conversation with Images

```typescript
const response = await ollama.chat({
  model: 'llava',
  messages: [
    {
      role: 'user',
      content: 'What is in this image?',
      images: ['./photo.jpg'],
    },
    {
      role: 'assistant',
      content: 'The image shows a cat sitting on a windowsill.',
    },
    {
      role: 'user',
      content: 'What color is the cat?',
      // No images needed — model remembers the previous image
    },
  ],
});
```

## Supported Image Formats

- JPEG/JPG
- PNG
- WebP
- GIF (first frame only)

## Notes

- Image processing increases token count — larger images cost more
- Vision models are slower than text-only models due to image encoding
- For best results, resize images to reasonable dimensions before sending
- The `images` field is only valid in `role: 'user'` messages
- Base64 images should NOT include the `data:image/...;base64,` prefix — pass raw base64 only
