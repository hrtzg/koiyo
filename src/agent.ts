import type { Worker } from "./worker";
import { isStream } from "./stream";
import { assertWorker, assertNonEmptyString } from "./utils";

/**
 * Options for agent execution
 */
export interface AgentOptions {
	/** Maximum number of tokens to generate per worker */
	maxTokens?: number;
	/** Whether to stream the final worker's response */
	stream?: boolean;
}

interface AgentFunction {
	(input: string, options: { stream: true }): Promise<AsyncIterable<string>>;
	(input: string, options?: { stream?: false }): Promise<string>;
	(input: string, options?: AgentOptions): Promise<
		string | AsyncIterable<string>
	>;
}

/**
 * Creates an agent that chains multiple workers together
 * Each worker processes the output of the previous worker
 * @param workers - One or more Worker instances to chain together
 * @returns An agent function that processes input through all workers
 * @throws {Error} If no workers are provided
 */
export function agent(...workers: Worker[]): AgentFunction {
	if (workers.length === 0) {
		throw new Error(
			"Agent must have at least one worker. Provide one or more Worker instances."
		);
	}

	// Validate that all workers are defined and valid
	for (let i = 0; i < workers.length; i++) {
		assertWorker(workers[i], `Agent worker at index ${i}`);
	}

	return (async (
		input: string,
		options?: AgentOptions
	): Promise<string | AsyncIterable<string>> => {
		assertNonEmptyString(input, "Agent input");

		const { maxTokens, stream } = options || {};
		let currentInput: string | unknown = input;

		// Process all workers except the last one normally
		for (let i = 0; i < workers.length - 1; i++) {
			const worker = workers[i];
			assertWorker(worker, `Worker at index ${i}`);
			const result = await worker.process(currentInput, { maxTokens });
			currentInput = result;
		}

		// Handle the last worker - stream if requested
		const lastWorker = workers[workers.length - 1];
		assertWorker(lastWorker, "Last worker");

		if (stream) {
			const result = await lastWorker.process(currentInput, {
				maxTokens,
				stream: true,
			});

			if (isStream(result)) {
				return result;
			}
		}

		const result = await lastWorker.process(currentInput, { maxTokens });
		// Convert to string if not a stream (handles JSON parsing from worker)
		return typeof result === "string" ? result : JSON.stringify(result);
	}) as AgentFunction;
}
