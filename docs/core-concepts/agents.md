---
outline: deep
---

# Agents

An **Agent** orchestrates multiple workers to process tasks sequentially. Each worker receives the output from the previous worker as its input.

## Creating an Agent

```typescript
import { Agent, Worker } from '@koiyo/core';
import { openai } from '@ai-sdk/openai';

const planner = new Worker()
	.model(openai('gpt-4o-mini'))
	.instructions('Create a brief plan.');

const executor = new Worker()
	.model(openai('gpt-4o-mini'))
	.instructions('Execute the plan. Keep responses brief.');

const agent = new Agent([planner, executor]);
```

## How Agents Work

Agents process tasks by:

1. Taking input and passing it to the first worker
2. Each worker processes the input and produces output
3. The output becomes the input for the next worker
4. The final worker's output is returned

Each worker receives enhanced context that includes:

- Information about previous workers and their outputs
- Information about upcoming workers
- A visual diagram of the agent flow

## Using an Agent

You can use an agent with the `generate` method:

```typescript
const response = await agent.generate('Say hello in one sentence.');
console.log(response);
```

Or with options:

::: code-group

```typescript [Streaming]
// With streaming
const stream = await agent.generate('Say hello in one sentence.', {
	stream: true,
});

for await (const chunk of stream) {
	process.stdout.write(chunk);
}
```

```typescript [Max Tokens]
// With max tokens
const response = await agent.generate('Say hello in one sentence.', {
	maxTokens: 100,
});
```

:::

## Agent Options

- `stream?: boolean` - Enable streaming for the final worker's response
- `maxTokens?: number` - Maximum tokens to generate per worker

## Best Practices

- **Single Responsibility**: Each worker should have a clear, focused purpose
- **Clear Instructions**: Provide specific, actionable instructions for each worker
- **Logical Flow**: Order workers so that each one builds on the previous output
- **Model Selection**: Use appropriate models for each worker's task complexity

::: tip Worker Ordering
The order of workers matters! Each worker receives the previous worker's output as input. Plan your worker chain carefully to ensure logical flow.
:::

::: warning Performance
Each worker in the chain processes sequentially. For better performance, consider using simpler models for early workers and more powerful models for final output.
:::
