# Miso 🍜

Miso is a tasty TypeScript framework for building agentic applications.

## Installation

```bash
# Using Bun (recommended)
bun add miso

# Using npm
npm install miso

# Using pnpm
pnpm add miso

# Using yarn
yarn add miso
```

## Quick Start

```typescript
import { agent, worker } from "miso";
import { openai } from "miso/models";

const planner = worker()
	.use(openai("gpt-4o-mini"))
	.context("Create a brief plan.");

const executor = worker()
	.use(openai("gpt-4o-mini"))
	.context("Execute the plan. Keep responses brief.");

const app = agent(planner, executor);

const response = await app("Say hello in one sentence.");
console.log(response);
```
