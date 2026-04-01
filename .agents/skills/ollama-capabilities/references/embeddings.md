# Embeddings

Ollama supports generating text embeddings — vector representations of text useful for semantic search, similarity comparison, clustering, and RAG (Retrieval-Augmented Generation).

## API Endpoint

```
POST http://localhost:11434/api/embed
```

## Recommended Models

| Model | Dimensions | Best For |
|-------|-----------|----------|
| `nomic-embed-text` | 768 | General purpose, fast |
| `embeddinggemma` | 768 | Google's embedding model |
| `qwen3-embedding` | 1024 | High quality, multilingual |
| `all-minilm` | 384 | Lightweight, fast |

Pull a model: `ollama pull nomic-embed-text`

## Code Examples

### JavaScript (SDK) — Single Input

```typescript
import ollama from 'ollama';

const response = await ollama.embed({
  model: 'nomic-embed-text',
  input: 'The quick brown fox jumps over the lazy dog',
});

console.log(response.embeddings[0]); // Float32Array (768 dimensions)
```

### JavaScript (SDK) — Batch Input

```typescript
const response = await ollama.embed({
  model: 'nomic-embed-text',
  input: [
    'Machine learning is a subset of artificial intelligence',
    'Deep learning uses neural networks with many layers',
    'I like to eat pizza on Fridays',
  ],
});

// response.embeddings — array of Float32Arrays
console.log(`Generated ${response.embeddings.length} embeddings`);
```

### JavaScript (fetch)

```typescript
const response = await fetch('http://localhost:11434/api/embed', {
  method: 'POST',
  body: JSON.stringify({
    model: 'nomic-embed-text',
    input: ['Hello world'],
  }),
});

const data = await response.json();
console.log(data.embeddings); // number[][]
```

### Python

```python
import ollama

response = ollama.embed(
    model='nomic-embed-text',
    input=['The quick brown fox', 'Hello world'],
)

for embedding in response['embeddings']:
    print(f'Embedding length: {len(embedding)}')
```

### cURL

```bash
curl http://localhost:11434/api/embed -d '{
  "model": "nomic-embed-text",
  "input": ["Hello world", "Goodbye world"]
}'
```

## Cosine Similarity

Use cosine similarity to compare embeddings:

```typescript
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Usage
const embeddings = response.embeddings;
const similarity = cosineSimilarity(embeddings[0], embeddings[1]);
console.log(`Similarity: ${similarity}`); // -1 to 1, higher = more similar
```

## Semantic Search Example

```typescript
import ollama from 'ollama';

const documents = [
  'Next.js is a React framework for production',
  'Tailwind CSS is a utility-first CSS framework',
  'Prisma is a next-generation ORM for Node.js',
  'Ollama runs large language models locally',
];

// Generate embeddings for all documents
const docResponse = await ollama.embed({
  model: 'nomic-embed-text',
  input: documents,
});

// Generate embedding for query
const queryResponse = await ollama.embed({
  model: 'nomic-embed-text',
  input: 'What tool helps with databases?',
});

// Find most similar document
const queryEmbedding = queryResponse.embeddings[0] as unknown as number[];
let bestIndex = 0;
let bestScore = -1;

docResponse.embeddings.forEach((docEmbedding, index) => {
  const score = cosineSimilarity(queryEmbedding, docEmbedding as unknown as number[]);
  if (score > bestScore) {
    bestScore = score;
    bestIndex = index;
  }
});

console.log(`Best match: "${documents[bestIndex]}" (score: ${bestScore})`);
// → "Prisma is a next-generation ORM for Node.js"
```

## Truncation Options

Control how input is truncated when it exceeds the model's context window:

```typescript
const response = await ollama.embed({
  model: 'nomic-embed-text',
  input: 'Very long text...',
  options: {
    num_ctx: 2048,  // Context window size
  },
  truncate: true,  // Truncate input to fit context (default: true)
});
```

## Notes

- Embeddings are deterministic — same input + model always produces the same vector
- Different models produce different dimension vectors — don't mix embeddings from different models
- Batch requests are more efficient than individual requests
- Embeddings are useful for: semantic search, clustering, duplicate detection, RAG, recommendation systems
- For RAG, embed your document chunks, store in a vector DB, then embed queries and find nearest neighbors
