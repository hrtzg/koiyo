# Koiyo 🎏

> [!CAUTION]
> Koiyo is in very early development. Do not use this for production.

Koiyo is a minimal TypeScript framework for building AI agents.

## Installation

```bash
# Using Bun (recommended)
bun add @koiyo/core

# Using npm
npm install @koiyo/core

# Using pnpm
pnpm add @koiyo/core

# Using yarn
yarn add @koiyo/core
```

## Quick Start

```typescript
import { Agent, Worker } from '@koiyo/core';
import { openai } from '@ai-sdk/openai';

const app = new Agent([
	new Worker()
		.model(openai('gpt-4o-mini'))
		.instructions('Create a brief plan.'),
	new Worker()
		.model(openai('gpt-4o-mini'))
		.instructions('Execute the plan. Keep responses brief.'),
]);

const response = await app.generate('Say hello in one sentence.');
console.log(response);
```

## Contributing

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## License

Koiyo is licensed under the MIT License. See [LICENSE](./LICENSE) for more information.
