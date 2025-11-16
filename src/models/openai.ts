import type { ModelAdapter } from "./adapter";
import { assertNonEmptyString } from "../utils";

/**
 * Supported OpenAI model names
 */
export type OpenAIModel =
	| "gpt-5"
	| "gpt-4o"
	| "gpt-4o-mini"
	| "gpt-4-turbo"
	| "gpt-4"
	| "gpt-4-32k"
	| "gpt-3.5-turbo"
	| "o1-preview"
	| "o1-mini";

/**
 * Configuration options for OpenAI model adapter
 */
export interface OpenAIConfig {
	/** OpenAI API key (defaults to OPENAI_API_KEY environment variable) */
	apiKey?: string;
	/** Base URL for OpenAI API (defaults to https://api.openai.com/v1) */
	baseURL?: string;
}

interface OpenAIError {
	message?: string;
}

interface OpenAIErrorResponse {
	error?: OpenAIError;
}

interface OpenAIResponseItem {
	id?: string;
	type?: string;
	content?: Array<{
		type?: string;
		text?: string;
	}>;
	delta?: {
		content?: Array<{
			type?: string;
			text?: string;
		}>;
	};
}

interface OpenAIResponse {
	output_text?: string;
	output?: OpenAIResponseItem[];
}

interface OpenAIStreamEvent {
	type?: string;
	delta?: string;
	text?: string;
	part?: {
		type?: string;
		text?: string;
	};
	item?: OpenAIResponseItem;
	response?: OpenAIResponse;
}

interface OpenAIResponseRequest {
	model: string;
	input: string;
	instructions?: string;
	temperature?: number;
	max_tokens?: number;
	stream?: boolean;
}

/**
 * Handles OpenAI API error responses and throws a descriptive error
 * @param response - The fetch Response object
 * @returns Promise that rejects with a descriptive error
 */
async function handleOpenAIError(response: Response): Promise<never> {
	const errorText = await response.text();
	let error: OpenAIErrorResponse;
	try {
		error = JSON.parse(errorText) as OpenAIErrorResponse;
	} catch {
		error = { error: { message: errorText || "Unknown error" } };
	}
	const statusText = response.statusText || "Unknown status";
	const errorMessage =
		error.error?.message || `HTTP ${response.status}: ${statusText}`;
	throw new Error(
		`OpenAI API request failed (status ${response.status}): ${errorMessage}`
	);
}

/**
 * Creates an OpenAI model adapter
 * @param model - The OpenAI model name (use OpenAIModel for IntelliSense, or string for custom models)
 * @param config - Optional configuration (API key, base URL)
 * @returns A function that returns a ModelAdapter
 */
export function openai(
	model: OpenAIModel | string,
	config?: OpenAIConfig
): () => ModelAdapter {
	return () => {
		const apiKey = config?.apiKey || process.env.OPENAI_API_KEY;
		if (!apiKey) {
			throw new Error(
				"OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass it in config."
			);
		}

		const baseURL = config?.baseURL || "https://api.openai.com/v1";

		async function* streamResponse(
			baseURL: string,
			apiKey: string,
			body: OpenAIResponseRequest
		): AsyncIterable<string> {
			const response = await fetch(`${baseURL}/responses`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${apiKey}`,
				},
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				await handleOpenAIError(response);
			}

			if (!response.body) {
				throw new Error(
					"OpenAI streaming response failed: response body is null. The API may have encountered an error."
				);
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = "";

			try {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					buffer += decoder.decode(value, { stream: true });
					const lines = buffer.split("\n");
					buffer = lines.pop() || "";

					for (const line of lines) {
						if (line.startsWith("data: ")) {
							const data = line.slice(6);
							if (data === "[DONE]") {
								return;
							}
							try {
								const event = JSON.parse(data) as OpenAIStreamEvent;

								// Handle different event types in Responses API streaming
								if (event.type === "response.output_text.delta") {
									// Text delta chunks - extract the delta string directly
									if (event.delta) {
										yield event.delta;
									}
								} else if (event.type === "response.output_text.done") {
									// Final text - yield the complete text (skip to avoid duplication)
									// The delta events already contain all the text
								} else if (event.type === "response.content_part.added") {
									// Content part added - check if it has text
									if (event.part?.text) {
										yield event.part.text;
									}
								} else if (event.type === "response.content_part.done") {
									// Content part done - skip to avoid duplication
								} else if (event.type === "response.output_item.done") {
									// Output item done - skip, already handled by deltas
								} else if (event.type === "response.completed") {
									// Response completed - skip, already handled by deltas
								}
							} catch {
								// Ignore parse errors for incomplete JSON
							}
						}
					}
				}
			} finally {
				reader.releaseLock();
			}
		}

		return {
			async generate(
				prompt: string,
				context?: string,
				options?: { maxTokens?: number; stream?: boolean }
			): Promise<string | AsyncIterable<string>> {
				assertNonEmptyString(prompt, "Prompt");

				const body: OpenAIResponseRequest = {
					model,
					input: prompt,
					temperature: 0.7,
				};

				if (context) {
					body.instructions = context;
				}

				if (options?.maxTokens !== undefined) {
					body.max_tokens = options.maxTokens;
				}

				if (options?.stream) {
					body.stream = true;
					return streamResponse(baseURL, apiKey, body);
				}

				const response = await fetch(`${baseURL}/responses`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${apiKey}`,
					},
					body: JSON.stringify(body),
				});

				if (!response.ok) {
					await handleOpenAIError(response);
				}

				const data = (await response.json()) as OpenAIResponse;
				// Use output_text helper if available, otherwise parse output array
				if (data.output_text) {
					return data.output_text;
				}
				// Fallback: parse output array for message items
				for (const item of data.output || []) {
					if (item.type === "message" && item.content) {
						for (const contentItem of item.content) {
							if (contentItem.type === "output_text" && contentItem.text) {
								return contentItem.text;
							}
						}
					}
				}
				throw new Error(
					"OpenAI API returned a response with no output text. The response may be malformed or empty."
				);
			},
		};
	};
}
