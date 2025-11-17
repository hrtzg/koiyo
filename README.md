# Koiyo 🎏

> [!CAUTION]
> Koiyo is in very early development. Do not use this for production.

Koiyo is a minimal TypeScript framework for building AI agents.

## Installation

```bash
# Using Bun (recommended)
bun add @koiyo/core @koiyo/models

# Using npm
npm install @koiyo/core @koiyo/models

# Using pnpm
pnpm add @koiyo/core @koiyo/models

# Using yarn
yarn add @koiyo/core @koiyo/models
```

## Quick Start

```typescript
import { Agent, Worker } from '@koiyo/core';
import { openai } from '@koiyo/models';

const app = new Agent([
	new Worker()
		.model(openai('gpt-4o-mini'))
		.instructions('Create a brief plan.'),
	new Worker()
		.model(openai('gpt-4o-mini'))
		.instructions('Execute the plan. Keep responses brief.'),
]);

console.log(await app.generate('Say hello in one sentence.'));
```

## Contributing

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## License

Koiyo is licensed under the MIT License. See [LICENSE](./LICENSE) for more information.
