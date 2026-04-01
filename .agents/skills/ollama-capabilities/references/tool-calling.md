# Tool Calling

Ollama supports tool calling (function calling), enabling models to invoke external functions during generation. This is the foundation for building AI agents that can interact with the real world.

## API Parameter

```
tools: [...tool definitions]
```

## Tool Definition Structure

Each tool follows the OpenAI-compatible format:

```typescript
{
  type: 'function',
  function: {
    name: 'get_weather',
    description: 'Get the current weather for a location',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'City name, e.g. "San Francisco"',
        },
        unit: {
          type: 'string',
          enum: ['celsius', 'fahrenheit'],
          description: 'Temperature unit',
        },
      },
      required: ['location'],
    },
  },
}
```

## Response Structure

When the model decides to call a tool, the response contains `tool_calls`:

```json
{
  "message": {
    "role": "assistant",
    "content": "",
    "tool_calls": [
      {
        "function": {
          "name": "get_weather",
          "arguments": { "location": "San Francisco", "unit": "celsius" }
        }
      }
    ]
  }
}
```

## Code Examples

### JavaScript (SDK) — Single Tool Call

```typescript
import ollama from 'ollama';

const response = await ollama.chat({
  model: 'qwen3.5',
  messages: [{ role: 'user', content: 'What is the weather in Tokyo?' }],
  tools: [
    {
      type: 'function',
      function: {
        name: 'get_weather',
        description: 'Get weather for a location',
        parameters: {
          type: 'object',
          properties: {
            location: { type: 'string' },
          },
          required: ['location'],
        },
      },
    },
  ],
});

if (response.message.tool_calls) {
  for (const tool of response.message.tool_calls) {
    console.log(`Call: ${tool.function.name}`);
    console.log(`Args: ${JSON.stringify(tool.function.arguments)}`);
  }
}
```

### JavaScript — Agent Loop (Multi-Turn)

```typescript
import ollama from 'ollama';

const tools = [
  {
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
  },
  {
    type: 'function',
    function: {
      name: 'multiply',
      description: 'Multiply two numbers',
      parameters: {
        type: 'object',
        properties: {
          a: { type: 'number' },
          b: { type: 'number' },
        },
        required: ['a', 'b'],
      },
    },
  },
];

// Tool implementations
const toolFunctions: Record<string, (args: any) => number> = {
  add: ({ a, b }) => a + b,
  multiply: ({ a, b }) => a * b,
};

// Agent loop
const messages: any[] = [
  { role: 'user', content: 'What is (3 + 5) * 2?' },
];

while (true) {
  const response = await ollama.chat({
    model: 'qwen3.5',
    messages,
    tools,
  });

  messages.push(response.message);

  // No tool calls = final answer
  if (!response.message.tool_calls?.length) {
    console.log('Answer:', response.message.content);
    break;
  }

  // Execute each tool call
  for (const tool of response.message.tool_calls) {
    const fn = toolFunctions[tool.function.name];
    const result = fn(tool.function.arguments);

    // Add tool result to conversation
    messages.push({
      role: 'tool',
      content: String(result),
    } as any);
  }
}
```

### Python — Agent Loop

```python
import ollama

def add(a: float, b: float) -> float:
    return a + b

def multiply(a: float, b: float) -> float:
    return a * b

tools = [
    {
        'type': 'function',
        'function': {
            'name': 'add',
            'description': 'Add two numbers',
            'parameters': {
                'type': 'object',
                'properties': {
                    'a': {'type': 'number'},
                    'b': {'type': 'number'},
                },
                'required': ['a', 'b'],
            },
        },
    },
]

available_functions = {'add': add, 'multiply': multiply}

messages = [{'role': 'user', 'content': 'What is 3 + 5?'}]

while True:
    response = ollama.chat(model='qwen3.5', messages=messages, tools=tools)
    messages.append(response['message'])

    if not response['message'].get('tool_calls'):
        print('Answer:', response['message']['content'])
        break

    for tool in response['message']['tool_calls']:
        fn = available_functions[tool['function']['name']]
        result = fn(**tool['function']['arguments'])
        messages.append({'role': 'tool', 'content': str(result)})
```

### Streaming Tool Calls

```typescript
const response = await ollama.chat({
  model: 'qwen3.5',
  messages: [{ role: 'user', content: 'Add 3 and 5' }],
  tools,
  stream: true,
});

for await (const chunk of response) {
  if (chunk.message.tool_calls) {
    for (const tool of chunk.message.tool_calls) {
      console.log(`Tool: ${tool.function.name}`);
      console.log(`Args: ${tool.function.arguments}`);
    }
  }
}
```

## Important Notes

- Models may call multiple tools in a single response (parallel tool calls)
- Always use an agent loop (`while True`) — the model may need multiple tool calls to answer
- Tool results must be added as `role: 'tool'` messages
- The model decides WHEN to call tools — it may answer directly without calling any
- Tool descriptions are critical — be specific about what each tool does
- Not all models support tool calling equally — `qwen3.5` has strong tool support
- Set `tool_calls` to empty or check `.length` to detect if model is done
