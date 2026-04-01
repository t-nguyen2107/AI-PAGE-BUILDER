# Structured Outputs

Ollama supports structured outputs to enforce that model responses conform to a specific JSON schema. This eliminates manual parsing and ensures type safety.

## API Parameter

```
format: <JSON Schema object | "json">
```

## Two Modes

### 1. JSON Schema Mode (Recommended)

Pass a JSON Schema object to enforce a specific structure:

```typescript
format: {
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "number" }
  },
  required: ["name", "age"]
}
```

### 2. Raw JSON Mode

Pass `"json"` to ensure valid JSON output without enforcing a specific schema:

```typescript
format: "json"
```

## Code Examples

### JavaScript with Zod (Recommended)

```typescript
import ollama from 'ollama';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Define schema
const PersonSchema = z.object({
  name: z.string().describe('The person\'s full name'),
  age: z.number().min(0).describe('Age in years'),
  hobbies: z.array(z.string()).describe('List of hobbies'),
});

const response = await ollama.chat({
  model: 'qwen3.5',
  messages: [{ role: 'user', content: 'Tell me about a fictional person' }],
  format: zodToJsonSchema(PersonSchema),
});

const person = PersonSchema.parse(JSON.parse(response.message.content));
console.log(person.name, person.age, person.hobbies);
```

### JavaScript with Raw Schema

```typescript
import ollama from 'ollama';

const response = await ollama.chat({
  model: 'qwen3.5',
  messages: [{ role: 'user', content: 'List 3 programming languages' }],
  format: {
    type: 'object',
    properties: {
      languages: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            year: { type: 'number' },
            paradigm: { type: 'string' },
          },
          required: ['name', 'year', 'paradigm'],
        },
      },
    },
    required: ['languages'],
  },
});

const result = JSON.parse(response.message.content);
```

### Python with Pydantic

```python
import ollama
from pydantic import BaseModel

class Language(BaseModel):
    name: str
    year: int
    paradigm: str

class Languages(BaseModel):
    languages: list[Language]

response = ollama.chat(
    model='qwen3.5',
    messages=[{'role': 'user', 'content': 'List 3 programming languages'}],
    format=Languages.model_json_schema(),
)

result = Languages.model_validate_json(response['message']['content'])
print(result.languages)
```

### cURL

```bash
curl http://localhost:11434/api/chat -d '{
  "model": "qwen3.5",
  "messages": [{"role": "user", "content": "Name a color"}],
  "format": {
    "type": "object",
    "properties": {
      "color": { "type": "string" }
    },
    "required": ["color"]
  }
}'
```

## Schema Best Practices

### 1. Add Descriptions

Descriptions help the model understand what each field should contain:

```typescript
const schema = {
  type: 'object',
  properties: {
    title: { type: 'string', description: 'The page title, under 60 characters' },
    description: { type: 'string', description: 'Meta description, under 160 characters' },
  },
};
```

### 2. Use Enums for Constrained Values

```typescript
const schema = {
  type: 'object',
  properties: {
    priority: {
      type: 'string',
      enum: ['low', 'medium', 'high', 'critical'],
      description: 'Issue priority level',
    },
  },
};
```

### 3. Nest Objects for Complex Structures

```typescript
const schema = {
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
            city: { type: 'string' },
            zip: { type: 'string' },
          },
        },
      },
    },
  },
};
```

## Integration with Zod-to-JSON-Schema

Install the package:

```bash
npm install zod-to-json-schema
```

Use with Zod schemas for type-safe structured outputs:

```typescript
import { zodToJsonSchema } from 'zod-to-json-schema';

// Convert any Zod schema to JSON Schema
const jsonSchema = zodToJsonSchema(myZodSchema);

// Pass to Ollama
const response = await ollama.chat({
  model: 'qwen3.5',
  messages: [...],
  format: jsonSchema,
});
```

## Important Notes

- Always validate the parsed output with Zod/Pydantic — the model may still produce invalid values for constraints like `min`, `max`, `pattern`
- The `format` parameter constrains the output structure but does NOT guarantee value-level validation
- Use `"json"` mode as a fallback when JSON Schema mode produces issues — then validate manually
- Structured outputs work best with models that have strong instruction-following capabilities
- The model output is always a JSON string — you must `JSON.parse()` it
