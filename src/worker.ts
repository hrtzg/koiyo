import type { ModelAdapter, GenerateOptions } from "./models/adapter";
import { isStream } from "./stream";
import {
	assertDefined,
	assertNonEmptyString,
	assertModelAdapter,
} from "./utils";

export interface WorkerProcessOptions {
	maxTokens?: number;
	stream?: boolean;
}

/**
 * Worker class that processes inputs through an AI model
 */
class Worker<I = unknown, O = unknown> {
	private modelAdapter?: ModelAdapter;
	private workerContext?: string;

	/**
	 * Set the model adapter to use
	 * @param modelFactory - A function that returns a ModelAdapter instance
	 * @throws {Error} If the model factory returns null or undefined
	 */
	model(modelFactory: () => ModelAdapter): this {
		const model = modelFactory();
		assertModelAdapter(model, "Model factory result");
		this.modelAdapter = model;
		return this;
	}

	/**
	 * Set the context/instructions for this worker
	 * @param context - The context string to use for this worker
	 * @throws {Error} If context is empty or invalid
	 */
	context(context: string): this {
		assertNonEmptyString(context, "Worker context");
		this.workerContext = context;
		return this;
	}

	/**
	 * Process input through the worker
	 * @param input - The input to process (will be converted to string if not already)
	 * @param options - Optional processing options (maxTokens, stream)
	 * @returns The processed output (parsed as JSON if possible, otherwise as string) or an AsyncIterable for streaming
	 * @throws {Error} If the worker has no model configured
	 */
	async process(
		input: I,
		options?: WorkerProcessOptions
	): Promise<O | AsyncIterable<string>> {
		assertModelAdapter(this.modelAdapter, "Worker model");
		assertDefined(input, "Worker input");

		// Convert input to string prompt
		const prompt =
			typeof input === "string" ? input : JSON.stringify(input, null, 2);

		// Prepare generation options
		const generateOptions: GenerateOptions = {};
		if (options?.maxTokens !== undefined) {
			generateOptions.maxTokens = options.maxTokens;
		}
		if (options?.stream !== undefined) {
			generateOptions.stream = options.stream;
		}

		// Generate response from model
		const result = await this.modelAdapter.generate(
			prompt,
			this.workerContext,
			generateOptions
		);

		// If streaming, return the async iterable directly
		if (options?.stream && isStream(result)) {
			return result;
		}

		// Otherwise, process the string result
		if (typeof result !== "string") {
			throw new Error(
				`Worker expected string result from model, but received ${typeof result}. This may indicate a model adapter issue.`
			);
		}

		const rawOutput = result;

		// Try to parse as JSON, fallback to string if parsing fails
		let output: O;
		try {
			const parsed = JSON.parse(rawOutput);
			output = parsed as O;
		} catch {
			// If parsing fails, treat as string
			output = rawOutput as O;
		}

		return output;
	}
}

/**
 * Factory function to create a new Worker instance
 * @returns A new Worker instance with generic input/output types
 */
export function worker<I = unknown, O = unknown>(): Worker<I, O> {
	return new Worker<I, O>();
}

/**
 * Type alias for Worker instances (exported for use in agent function)
 */
export type { Worker };
