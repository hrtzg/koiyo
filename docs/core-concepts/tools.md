---
outline: deep
---

# Tools

**Tools** extend workers with custom functionality. They allow workers to perform actions beyond text generation, such as API calls, calculations, or data manipulation.

## Creating a Tool

```typescript
import { Tool } from "@koiyo/core";
import { z } from "zod";

const greetingTool = new Tool()
	.meta({
		name: "Greeting Tool",
		description: "Used to greet people by their name",
	})
	.input(z.string())
	.output(z.string())
	.execute(({ input }) => {
		return `Hi, ${input}!`;
	});
```

::: info Schema Library Support
Koiyo supports any schema validation library that implements the [Standard Schema](https://github.com/standard-schema/standard-schema) specification. This includes:

- [Zod](https://zod.dev)
- [Valibot](https://valibot.dev)
- [ArkType](https://arktype.io)
- And any other Standard Schema-compatible library

You can use whichever library you prefer!
:::

## Tool Components

### Meta

Define metadata about the tool:

```typescript
.meta({
	name: "Tool Name",
	description: "What the tool does"
})
```

- `name`: A clear, descriptive name for the tool
- `description`: Explain what the tool does and when to use it

### Input Schema

Define the input validation schema using Zod (or any [Standard Schema](https://github.com/standard-schema/standard-schema)-compatible library):

```typescript
.input(z.string())  // Single string input
.input(z.object({   // Object input
	name: z.string(),
	age: z.number()
}))
```

The schema ensures type safety and provides validation.

### Output Schema

Define the output validation schema using Zod (or any [Standard Schema](https://github.com/standard-schema/standard-schema)-compatible library):

```typescript
.output(z.string())  // Single string output
.output(z.object({  // Object output
	result: z.number(),
	message: z.string()
}))
```

The output schema validates the return value from your execute function, ensuring type safety and consistent return types.

### Execute Function

Define the tool's execution logic:

```typescript
.execute(({ input }) => {
	// Tool logic here
	return result;
})
```

The execute function receives:

- `input`: The validated input based on your schema
- Additional context (when available)

## Example: Calculator Tool

```typescript
import { Tool } from "@koiyo/core";
import { z } from "zod";

const calculatorTool = new Tool()
	.meta({
		name: "Calculator",
		description: "Performs basic arithmetic operations",
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
				return b !== 0 ? a / b : "Cannot divide by zero";
		}
	});
```

## Example: API Tool

```typescript
const weatherTool = new Tool()
	.meta({
		name: "Weather",
		description: "Gets the current weather for a location",
	})
	.input(
		z.object({
			location: z.string(),
		})
	)
	.output(
		z.object({
			temperature: z.number(),
			condition: z.string(),
			humidity: z.number(),
		})
	)
	.execute(async ({ input }) => {
		const response = await fetch(
			`https://api.weather.com/v1/current?location=${input.location}`
		);
		return await response.json();
	});
```

::: tip Async Tools
Tools can be async! This is perfect for API calls, database queries, or any I/O operations. The agent will wait for the tool to complete before continuing.
:::

## Attaching Tools to Workers

```typescript
const executor = new Worker()
	.model(openai("gpt-4o-mini"))
	.instructions("Execute the plan. Use tools when needed.")
	.tools([greetingTool, calculatorTool, weatherTool]);
```

## Dependencies

Tools use [Zod](https://zod.dev) for input and output validation. Make sure to install it:

::: code-group

```sh [bun]
$ bun add zod
```

```sh [npm]
$ npm install zod
```

```sh [pnpm]
$ pnpm add zod
```

```sh [yarn]
$ yarn add zod
```

:::

::: info Standard Schema Support
Koiyo supports any schema library that implements the [Standard Schema](https://github.com/standard-schema/standard-schema) specification, including Zod, Valibot, and ArkType. Examples in this documentation use Zod, but you can use whichever library you prefer.
:::

## Best Practices

- **Clear Descriptions**: Write descriptions that help the model understand when to use the tool
- **Type Safety**: Use Standard Schema-compatible schemas for both input and output validation
- **Output Schemas**: Always define output schemas to ensure consistent return types
- **Error Handling**: Handle errors gracefully in your execute functions
- **Async Support**: Tools can be async for API calls or database operations
- **Idempotency**: When possible, make tools idempotent for better reliability

::: warning Input and Output Validation
Always validate tool inputs and outputs using Standard Schema-compatible schemas. Invalid inputs or outputs will cause tool execution to fail, potentially breaking your agent workflow.
:::

::: tip Tool Descriptions
The `description` field in tool metadata is crucial. The model uses this to decide when to call your tool. Be specific about what the tool does and when it should be used.
:::
