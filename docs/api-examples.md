---
outline: deep
---

# Examples

This page contains practical examples demonstrating how to use Koiyo.

::: tip Running Examples
All examples assume you have Koiyo installed. You can provide your API key in two ways:

1. **Environment variable** (recommended): Set `OPENAI_API_KEY` in your environment
2. **Direct parameter**: Pass the API key directly to the model function:

```typescript
const worker = new Worker().model(
	openai('gpt-4o-mini', { apiKey: 'your-api-key-here' })
);
```

See the [Getting Started](/getting-started) guide for setup instructions.
:::

## Basic Agent

A simple agent with a single worker:

```typescript
import { Agent, Worker } from '@koiyo/core';
import { openai } from '@ai-sdk/openai';

const worker = new Worker()
	.model(openai('gpt-4o-mini'))
	.instructions('You are a helpful assistant.');

const agent = new Agent([worker]);

const response = await agent.generate('Say hello!');
console.log(response);
```

## Multi-Worker Agent

An agent that chains multiple workers:

```typescript
import { Agent, Worker } from '@koiyo/core';
import { openai } from '@ai-sdk/openai';

const planner = new Worker()
	.model(openai('gpt-4o-mini'))
	.instructions('Create a brief plan.');

const executor = new Worker()
	.model(openai('gpt-4o-mini'))
	.instructions('Execute the plan. Keep responses brief.');

const agent = new Agent([planner, executor]); // [!code highlight]

const response = await agent.generate('Plan and execute a greeting.');
console.log(response);
```

::: info Worker Chain
The planner's output automatically becomes the executor's input. Each worker in the chain receives enhanced context about previous and upcoming workers.
:::

## Agent with Tools

An agent that uses tools:

```typescript
import { Agent, Worker, Tool } from '@koiyo/core';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const greetingTool = new Tool()
	.meta({
		name: 'Greeting Tool',
		description: 'Used to greet people by their name',
	})
	.input(z.string())
	.output(z.string())
	.execute(({ input }) => {
		return `Hi, ${input}!`;
	});

const executor = new Worker()
	.model(openai('gpt-4o-mini'))
	.instructions('Execute the plan. Use tools when needed.')
	.tools([greetingTool]);

const agent = new Agent([executor]);

const response = await agent.generate('Greet Alice using the tool.');
console.log(response);
```

## Streaming Response

An agent with streaming enabled:

```typescript
import { Agent, Worker } from '@koiyo/core';
import { openai } from '@ai-sdk/openai';

const worker = new Worker()
	.model(openai('gpt-4o-mini'))
	.instructions('You are a storyteller.');

const agent = new Agent([worker]);

const stream = await agent.generate('Tell me a short story.', { stream: true });

for await (const chunk of stream) {
	process.stdout.write(chunk);
}
```

::: tip Streaming Benefits
Streaming provides a better user experience by showing responses as they're generated, rather than waiting for the complete response.
:::

## Conversation

A stateful conversation:

```typescript
import { Conversation, Agent, Worker } from '@koiyo/core';
import { openai } from '@ai-sdk/openai';

const agent = new Agent([
	new Worker()
		.model(openai('gpt-4o-mini'))
		.instructions('You are a helpful assistant.'),
]);

const conversation = new Conversation(agent, {
	state: {},
	stream: true,
});

// First message
await conversation.send("Hi, I'm Alice!");

// Follow-up message (maintains context)
await conversation.send('What did I just say my name was?');
```

::: info Conversation Memory
Conversations maintain context across messages. The agent remembers previous interactions within the same conversation instance.
:::

### With Memory and Persistence

For semantic search and result storage:

```typescript
import { Conversation, Agent, Worker } from '@koiyo/core';
import { openai } from '@ai-sdk/openai';
import { chroma } from '@koiyo/memory';
import { redis } from '@koiyo/persistence';

const agent = new Agent([
	new Worker()
		.model(openai('gpt-4o-mini'))
		.instructions('You are a helpful assistant.'),
]);

const conversation = new Conversation(agent, {
	state: {},
	stream: true,
	memory: chroma({
		// [!code highlight]
		url: process.env.CHROMA_URL || 'http://localhost:8000',
		apiKey: process.env.CHROMA_API_KEY,
	}),
	persistence: redis({
		// [!code highlight]
		url: process.env.REDIS_URL || 'redis://localhost:6379',
		password: process.env.REDIS_PASSWORD,
	}),
});

await conversation.send("Hi, I'm Alice!");
```

::: tip Memory vs Persistence

- **Memory** (vector databases): For semantic search and context retrieval
- **Persistence** (traditional databases/cache): For storing conversation results and data
  :::

::: info Other Adapter Options
You can use different adapters:

```typescript
// Memory adapters (vector databases)
import { pinecone } from '@koiyo/memory';
import { qdrant } from '@koiyo/memory';

// Persistence adapters
import { postgres } from '@koiyo/persistence';
```

Each adapter has provider-specific configuration options.
:::

### Accessing Messages and Events

```typescript
// Get all messages
const messages = conversation.messages;
console.log('All messages:', messages);

// Listen to events
conversation.on('message:sent', message => {
	console.log('Sent:', message.content);
});

conversation.on('message:received', message => {
	console.log('Received:', message.content);
});
```

## Complete Example

A complete example combining all concepts:

```typescript
import { Agent, Worker, Tool, Conversation } from '@koiyo/core';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Create a tool
const greetingTool = new Tool()
	.meta({
		name: 'Greeting Tool',
		description: 'Used to greet people by their name',
	})
	.input(z.string())
	.output(z.string())
	.execute(({ input }) => {
		return `Hi, ${input}!`;
	});

// Create workers
const planner = new Worker()
	.model(openai('gpt-4o-mini'))
	.instructions('Create a brief plan.');

const executor = new Worker()
	.model(openai('gpt-4o-mini'))
	.instructions('Execute the plan. Keep responses brief.')
	.tools([greetingTool]);

// Create an agent
const genericAgent = new Agent([planner, executor]);

// Create a conversation
const genericConversation = new Conversation(genericAgent, {
	state: {},
	stream: true,
});

// Send a message
genericConversation.send('My cool message!');
```
