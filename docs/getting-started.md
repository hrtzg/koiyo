---
outline: deep
---

# Getting Started

Koiyo is a TypeScript framework for building AI agents. This guide will help you get up and running quickly.

## Installation

::: code-group

```sh [bun]
$ bun add @koiyo/core @koiyo/models
```

```sh [pnpm]
$ pnpm add @koiyo/core @koiyo/models
```

```sh [npm]
$ npm install @koiyo/core @koiyo/models
```

```sh [yarn]
$ yarn add @koiyo/core @koiyo/models
```

:::

## Core Concepts

Koiyo is built around four core components:

- **Agent**: Orchestrates multiple workers to process tasks
- **Worker**: A single processing unit with a model and instructions
- **Tool**: Extends workers with custom functionality
- **Conversation**: Manages stateful interactions with agents

## Quick Example

Here's a practical example that demonstrates all the core concepts working together:

```typescript
import { Agent, Worker, Tool, Conversation } from "@koiyo/core";
import { openai } from "@koiyo/models";
import { z } from "zod"; // Any Standard Schema-compatible library works!

// Step 1: Create a tool that extends worker capabilities
const calculatorTool = new Tool()
	.meta({
		name: "Calculator",
		description:
			"Performs basic math operations (add, subtract, multiply, divide)",
	})
	.input(
		z.object({
			operation: z.enum(["add", "subtract", "multiply", "divide"]),
			a: z.number(),
			b: z.number(),
		})
	)
	.output(z.union([z.number(), z.string()]))
	.execute(({ input }) => {
		const { operation, a, b } = input;
		switch (operation) {
			case "add":
				return a + b;
			case "subtract":
				return a - b;
			case "multiply":
				return a * b;
			case "divide":
				return b !== 0 ? a / b : "Error: Division by zero";
		}
	});

// Step 2: Create specialized workers
// The planner analyzes the request and creates a step-by-step plan
const planner = new Worker()
	.model(openai("gpt-4o-mini"))
	.instructions(
		"Analyze the user's request and create a clear, step-by-step plan. " +
			"Break down complex tasks into smaller, actionable steps."
	);

// The executor follows the plan and uses tools when needed
const executor = new Worker()
	.model(openai("gpt-4o-mini"))
	.instructions(
		"Execute the plan step by step. Use available tools when calculations " +
			"or specific operations are needed. Provide clear, concise responses."
	)
	.tools([calculatorTool]);

// Step 3: Chain workers together into an agent
const agent = new Agent([planner, executor]);

// Step 4: Create a conversation with state management
const conversation = new Conversation(agent, {
	state: {
		userName: "Alice",
		interactionCount: 0,
	},
	stream: true,
	// Optional: Add memory adapter for semantic search
	// memory: chroma({ url: "http://localhost:8000", apiKey: "..." }),
	// Optional: Add persistence adapter for storing results
	// persistence: redis({ url: "redis://localhost:6379" }),
});

// Step 5: Use the conversation
async function main() {
	// First interaction
	const response1 = await conversation.send(
		"Calculate 15 * 23 and then add 100 to the result"
	);
	console.log("Response:", response1);

	// The conversation maintains state across interactions
	const response2 = await conversation.send(
		"What was the final result from my previous calculation?"
	);
	console.log("Follow-up:", response2);
}

main();
```

This example demonstrates:

- **Tools**: The `calculatorTool` extends the executor's capabilities
- **Workers**: Two specialized workers (`planner` and `executor`) with distinct roles
- **Agents**: Workers are chained together, with the planner's output feeding into the executor
- **Conversations**: Stateful interactions that remember context across messages

## How It Works

1. **Workers** are configured with a model and instructions
2. **Tools** can be attached to workers to extend their capabilities
3. **Agents** chain workers together, passing output from one to the next
4. **Conversations** manage the interaction flow and maintain state

::: tip Next Steps
Ready to dive deeper? Check out the core concepts guides to learn more about each component.
:::

## Next Steps

- Learn more about [Workers](/core-concepts/workers)
- Explore [Tools](/core-concepts/tools)
- Understand [Agents](/core-concepts/agents)
- See [Conversations](/core-concepts/conversations)
- Check out [Examples](/api-examples)
