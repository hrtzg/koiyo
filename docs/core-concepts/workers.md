---
outline: deep
---

# Workers

A **Worker** is a single processing unit that uses a language model to perform a task. Workers are the building blocks of agents.

## Creating a Worker

```typescript
import { Worker } from '@koiyo/core';
import { openai } from '@ai-sdk/openai';

const worker = new Worker()
	.model(openai('gpt-4o-mini'))
	.instructions('You are a helpful assistant.');
```

## Configuration

### Model

Set the language model to use:

```typescript{1}
const worker = new Worker().model(openai("gpt-4o-mini"));
```

The model factory function is called when the worker is used, allowing for dynamic configuration.

::: info Model Factory
The model factory pattern allows for lazy initialization and dynamic configuration. The factory function is called each time the worker processes a task.
:::

### Instructions

Provide context and instructions for the worker:

```typescript
const worker = new Worker()
	.model(openai('gpt-4o-mini'))
	.instructions(
		'You are a code reviewer. Review the code and provide feedback.'
	);
```

Instructions should be clear and specific about what the worker should do.

::: tip Writing Instructions
Good instructions are:

- **Specific**: Clearly define the worker's role and responsibilities
- **Actionable**: Tell the worker what to do, not just what it is
- **Contextual**: Include relevant context about the task domain
  :::

### Tools

Attach tools to extend the worker's capabilities:

```typescript
const worker = new Worker()
	.model(openai('gpt-4o-mini'))
	.instructions('Execute the plan. Keep responses brief.')
	.tools([greetingTool, calculatorTool]);
```

See the [Tools](/core-concepts/tools) documentation for more information.

## Worker Context

When a worker is part of an agent, it receives enhanced context that includes:

- **Agent Process Flow**: A visual diagram showing all workers in the chain
- **Execution History**: Outputs from previous workers
- **Upcoming Workers**: Information about workers that will run after this one
- **Your Task**: The worker's own instructions

This context helps workers understand their role in the larger agent workflow.

## Example: Multi-Worker Agent

```typescript
const researcher = new Worker()
	.model(openai('gpt-4o-mini'))
	.instructions('Research the topic and provide key facts.');

const writer = new Worker()
	.model(openai('gpt-4o-mini'))
	.instructions('Write a clear, concise summary based on the research.');

const editor = new Worker()
	.model(openai('gpt-4o-mini'))
	.instructions('Review and improve the writing for clarity and style.');

const agent = new Agent([researcher, writer, editor]);
```

## Best Practices

- **Clear Instructions**: Be specific about what the worker should do
- **Appropriate Models**: Use simpler models for straightforward tasks, more powerful models for complex reasoning
- **Focused Purpose**: Each worker should have a single, well-defined responsibility
- **Context Awareness**: Workers in agents automatically receive context about the workflow

::: info Enhanced Context
When workers are part of an agent, they automatically receive rich context including execution history and workflow diagrams. This helps them understand their role in the larger system.
:::

::: tip Model Selection

- Use `gpt-4o-mini` for simple, straightforward tasks
- Use `gpt-4o` for complex reasoning and analysis
- Use `o1-preview` for advanced problem-solving
  :::
