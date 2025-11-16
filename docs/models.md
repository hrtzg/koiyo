---
outline: deep
---

# Models

Koiyo supports multiple model providers through adapters. Currently, OpenAI is supported with more providers coming soon.

## OpenAI

The OpenAI adapter supports all OpenAI models including GPT-4, GPT-3.5, and O1 models.

### Basic Usage

```typescript
import { openai } from "@koiyo/models";

const worker = new Worker().model(openai("gpt-4o-mini"));
```

By default, the OpenAI adapter uses the `OPENAI_API_KEY` environment variable. You can also pass the API key directly:

```typescript
const worker = new Worker().model(
	openai("gpt-4o-mini", { apiKey: "your-api-key-here" })
);
```

### Configuration

You can configure the OpenAI adapter with custom settings:

```typescript
const worker = new Worker().model(
	openai("gpt-4o-mini", {
		apiKey: process.env.OPENAI_API_KEY,
		baseURL: "https://api.openai.com/v1",
	})
);
```

::: info API Key Security
Always use environment variables for API keys in production. Never commit API keys to version control. Passing the API key directly is useful for quick testing or when environment variables aren't available.
:::

### Supported Models

| Model           | Best For              | Cost      |
| --------------- | --------------------- | --------- |
| `gpt-5`         | Latest capabilities   | Highest   |
| `gpt-4o`        | Complex reasoning     | High      |
| `gpt-4o-mini`   | General purpose       | Low       |
| `gpt-4-turbo`   | Advanced tasks        | High      |
| `gpt-4`         | Standard tasks        | High      |
| `gpt-4-32k`     | Long context          | Very High |
| `gpt-3.5-turbo` | Simple tasks          | Very Low  |
| `o1-preview`    | Problem solving       | High      |
| `o1-mini`       | Light problem solving | Medium    |

::: tip Model Selection Guide

- **Development/Testing**: Use `gpt-4o-mini` for cost-effective testing
- **Production (Simple)**: Use `gpt-4o-mini` or `gpt-3.5-turbo`
- **Production (Complex)**: Use `gpt-4o` or `gpt-4-turbo`
- **Problem Solving**: Use `o1-preview` for advanced reasoning
  :::

### Environment Variables

By default, the OpenAI adapter uses the `OPENAI_API_KEY` environment variable:

::: code-group

```sh [bash]
export OPENAI_API_KEY=your-api-key-here
```

```sh [.env]
OPENAI_API_KEY=your-api-key-here
```

:::

### Custom Base URL

You can use a custom base URL for OpenAI-compatible APIs:

```typescript
const worker = new Worker().model(
	openai("gpt-4o-mini", {
		baseURL: "https://your-custom-api.com/v1",
	})
);
```

::: tip OpenAI-Compatible APIs
This is useful for using OpenAI-compatible APIs like:

- Local LLM servers
- Proxy services
- Custom API endpoints
  :::

## Model Adapters

Model adapters implement the `ModelAdapter` interface, which provides a consistent API for different providers:

```typescript
interface ModelAdapter {
	generate(
		prompt: string,
		context: string,
		options?: GenerateOptions
	): Promise<string | AsyncIterable<string>>;
}
```

## Future Providers

More model providers are planned:

::: details Coming Soon

- **Anthropic Claude** - Advanced reasoning and safety
- **Google Gemini** - Multimodal capabilities
- **Mistral AI** - Open-source alternatives
- **And more...**

:::

::: info Contributing
Want to add support for a new model provider? Check out our contribution guidelines or open an issue to request a provider.
:::
