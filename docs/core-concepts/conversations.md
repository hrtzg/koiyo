---
outline: deep
---

# Conversations

A **Conversation** manages stateful interactions with an agent. It maintains context across multiple messages and supports streaming responses.

## Creating a Conversation

```typescript
import { Conversation, Agent, Worker } from "@koiyo/core";
import { openai } from "@koiyo/models";

const agent = new Agent([
	new Worker()
		.model(openai("gpt-4o-mini"))
		.instructions("You are a helpful assistant."),
]);

const conversation = new Conversation(agent, {
	state: {},
	stream: true,
});
```

## Conversation Options

### State

Maintain custom state across the conversation:

```typescript
const conversation = new Conversation(agent, {
	state: {
		userName: "Alice",
		preferences: {
			language: "en",
			tone: "friendly",
		},
	},
	stream: true,
});
```

The state object is available throughout the conversation lifecycle.

::: tip State Persistence
State is maintained in memory by default. For persistent storage, consider using memory and persistence adapters (see below).
:::

### Memory Adapter

For semantic search and context retrieval, you can use a memory adapter (vector database) to store and retrieve relevant conversation information:

```typescript{67-76}
import { Conversation, Agent, Worker } from "@koiyo/core";
import { openai } from "@koiyo/models";
import { chroma } from "@koiyo/memory";

const agent = new Agent([
	new Worker()
		.model(openai("gpt-4o-mini"))
		.instructions("You are a helpful assistant."),
]);

// Create conversation with memory for semantic search
const conversation = new Conversation(agent, {
	state: {},
	stream: true,
	memory: chroma({ // [!code highlight]
		url: process.env.CHROMA_URL || "http://localhost:8000", // [!code highlight]
		apiKey: process.env.CHROMA_API_KEY, // [!code highlight]
	}), // [!code highlight]
});
```

::: info Available Memory Adapters
Koiyo supports multiple vector database adapters for memory. Import the one you need:

```typescript
import { chroma } from "@koiyo/memory"; // ChromaDB
import { pinecone } from "@koiyo/memory"; // Pinecone
import { qdrant } from "@koiyo/memory"; // Qdrant
// More coming soon...
```

Each adapter follows the same pattern but with provider-specific configuration options.
:::

::: info Memory Benefits
Using a memory adapter enables:

- **Semantic Search**: Find relevant past conversations using embeddings
- **Context Retrieval**: Automatically retrieve relevant context from past interactions
- **Long-term Memory**: Store and recall conversation context across sessions
  :::

The memory adapter handles storing and retrieving conversation context using vector embeddings, allowing your agent to maintain semantic memory and access relevant past interactions.

### Persistence Adapter

For storing conversation results and data, you can use a persistence adapter (traditional database or cache):

```typescript
import { Conversation, Agent, Worker } from "@koiyo/core";
import { openai } from "@koiyo/models";
import { redis } from "@koiyo/persistence";

const agent = new Agent([
	new Worker()
		.model(openai("gpt-4o-mini"))
		.instructions("You are a helpful assistant."),
]);

// Create conversation with persistence for storing results
const conversation = new Conversation(agent, {
	state: {},
	stream: true,
	persistence: redis({
		url: process.env.REDIS_URL || "redis://localhost:6379",
		password: process.env.REDIS_PASSWORD,
	}),
});
```

::: info Available Persistence Adapters
Koiyo supports multiple persistence adapters. Import the one you need:

```typescript
import { local } from "@koiyo/persistence"; // Local file-based storage
import { redis } from "@koiyo/persistence"; // Redis
import { postgres } from "@koiyo/persistence"; // PostgreSQL
// More coming soon...
```

Each adapter follows the same pattern but with provider-specific configuration options.
:::

::: info Persistence Benefits
Using a persistence adapter enables:

- **Result Storage**: Store conversation results and outputs
- **Data Persistence**: Persist conversation data across sessions
- **Fast Retrieval**: Quick access to stored conversation data
  :::

The persistence adapter handles storing conversation results and data, allowing you to persist and retrieve conversation outputs efficiently.

### Streaming

Enable streaming responses:

```typescript
const conversation = new Conversation(agent, {
	state: {},
	stream: true, // Enable streaming
});
```

## Sending Messages

### Basic Usage

```typescript
const response = await conversation.send("Hello!");
console.log(response);
```

### With Streaming

```typescript
const stream = await conversation.send("Tell me a story");

for await (const chunk of stream) {
	process.stdout.write(chunk);
}
```

### With Options

```typescript
const response = await conversation.send("Hello!", {
	maxTokens: 100,
});
```

## Accessing Messages

### Get All Messages

Access all messages in the conversation:

```typescript
const messages = conversation.messages;
console.log(messages);
// [
//   { role: "user", content: "Hello!", timestamp: ... },
//   { role: "assistant", content: "Hi there!", timestamp: ... },
//   ...
// ]
```

The `messages` property returns an array of all messages in the conversation, including both user messages and assistant responses.

## Event Listeners

Listen to conversation events to react to messages being sent and received:

```typescript
// Listen for messages being sent
conversation.on("message:sent", (message) => {
	console.log("User sent:", message.content);
});

// Listen for messages being received
conversation.on("message:received", (message) => {
	console.log("Assistant replied:", message.content);
});

// Listen for all message events
conversation.on("message", (event) => {
	console.log("Message event:", event.type, event.message);
});

// Remove a listener
conversation.off("message:sent", handler);

// Remove all listeners for an event
conversation.off("message:sent");
```

### Available Events

- `message:sent` - Fired when a user message is sent
- `message:received` - Fired when an assistant response is received
- `message` - Fired for all message events (includes type in event object)

::: tip Event-Driven Architecture
Use event listeners to build reactive applications that respond to conversation events in real-time, such as updating UI, logging, or triggering side effects.
:::

## Managing State

Access and update state:

```typescript
// State is available in tool execution contexts
const stateTool = new Tool()
	.meta({
		name: "Update State",
		description: "Updates conversation state",
	})
	.input(
		z.object({
			key: z.string(),
			value: z.any(),
		})
	)
	.output(z.string())
	.execute(({ input, state }) => {
		state[input.key] = input.value;
		return `Updated ${input.key}`;
	});
```

## Conversation Lifecycle

1. **Creation**: Initialize with an agent and options
2. **Messages**: Send messages and receive responses
3. **State Management**: State persists across messages
4. **Streaming**: Handle streaming responses as they arrive
5. **Memory & Persistence**: Use adapters for long-term storage and retrieval
6. **Event Handling**: Listen to conversation events for reactive behavior

## Example: Chat Application

```typescript
const chatAgent = new Agent([
	new Worker()
		.model(openai("gpt-4o-mini"))
		.instructions("You are a friendly chat assistant."),
]);

const chat = new Conversation(chatAgent, {
	state: {
		messages: [],
	},
	stream: true,
});

// First message
await chat.send("Hi, I'm Alice!");

// Follow-up message (maintains context)
await chat.send("What did I just say my name was?");
```

## Best Practices

- **State Initialization**: Initialize state with default values
- **Streaming**: Use streaming for better user experience in interactive applications
- **State Management**: Keep state minimal and focused on conversation context
- **Memory & Persistence**: Use memory adapters for semantic search and persistence adapters for storing results
- **Event Listeners**: Use event listeners for reactive behavior and side effects
- **Error Handling**: Handle errors gracefully, especially with streaming

::: warning Memory Considerations
Without memory or persistence adapters, conversation state is stored in memory. For production applications with many concurrent conversations, consider using adapters to avoid memory issues.
:::
