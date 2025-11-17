import { convertAsyncIteratorToReadableStream } from '@ai-sdk/provider-utils';
import type { LanguageModel } from '../languageModel';

export interface GenerateOptions {
	stream?: boolean;
}

const createPrompt = (prompt: string, instructions?: string) => {
	const messages: Array<
		| { role: 'system'; content: string }
		| { role: 'user'; content: Array<{ type: 'text'; text: string }> }
	> = [];

	if (instructions) {
		messages.push({
			role: 'system',
			content: instructions,
		});
	}

	messages.push({
		role: 'user',
		content: [
			{
				type: 'text',
				text: prompt,
			},
		],
	});

	return messages;
};

export async function generate(
	languageModel: LanguageModel,
	prompt: string,
	options?: GenerateOptions & { stream?: false; instructions?: string }
): Promise<string>;
export async function generate(
	languageModel: LanguageModel,
	prompt: string,
	options: GenerateOptions & { stream: true; instructions?: string }
): Promise<ReadableStream<string>>;
export async function generate(
	languageModel: LanguageModel,
	prompt: string,
	options?: GenerateOptions & { instructions?: string }
): Promise<string | ReadableStream<string>> {
	const { instructions } = options ?? {};

	if (options?.stream) {
		const result = await languageModel.doStream({
			prompt: createPrompt(prompt, instructions),
		});

		// Transform stream to only emit text deltas using async generator
		async function* extractTextDeltas() {
			const reader = result.stream.getReader();
			try {
				for (;;) {
					const { done, value } = await reader.read();
					if (done) break;

					if (value.type === 'text-delta') {
						yield value.delta;
					}
				}
			} finally {
				reader.releaseLock();
			}
		}

		return convertAsyncIteratorToReadableStream(extractTextDeltas());
	}

	const result = await languageModel.doGenerate({
		prompt: createPrompt(prompt, instructions),
	});

	// Extract text from content array
	const textParts = result.content
		.filter(item => item.type === 'text')
		.map(item => item.text)
		.join('');

	return textParts;
}
