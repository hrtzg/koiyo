import type { Worker } from "../worker";
import type { AgentOptions, AgentFunction, WorkerInfo, WorkerContext } from "./types";
import { assertWorker, assertNonEmptyString } from "../utils";
import { processWorker, processFinalWorker } from "./execution";

/**
 * Creates an agent that chains multiple workers together
 * Each worker processes the output of the previous worker
 * @param workers - One or more Worker instances to chain together
 * @returns An agent function that processes input through all workers
 * @throws {Error} If no workers are provided
 */
export function agent(...workers: readonly Worker[]): AgentFunction {
	if (workers.length === 0) {
		throw new Error(
			"Agent must have at least one worker. Provide one or more Worker instances."
		);
	}

	// Validate that all workers are defined and valid
	for (let i = 0; i < workers.length; i++) {
		assertWorker(workers[i], `Agent worker at index ${i}`);
	}

	// Extract worker contexts and model adapters upfront
	const workerInfo: readonly WorkerInfo[] = workers.map((worker, index) => {
		assertWorker(worker, `Worker at index ${index}`);
		return {
			index,
			context: worker.getBaseContext() || "",
			modelAdapter: worker.getModelAdapter(),
		} as const;
	});

	return (async (
		input: string,
		options?: AgentOptions
	): Promise<string | AsyncIterable<string>> => {
		assertNonEmptyString(input, "Agent input");

		const { maxTokens, stream } = options ?? {};
		let currentInput: unknown = input;
		const previousOutputs: Array<{
			readonly index: number;
			readonly output: string;
			readonly context: string;
		}> = [];

		// Build worker contexts array for diagram
		const workerContexts: readonly WorkerContext[] = workerInfo.map(
			(info) => ({
				index: info.index,
				context: info.context,
			})
		);

		// Process all workers except the last one
		for (let i = 0; i < workerInfo.length - 1; i++) {
			const worker = workerInfo[i];
			if (!worker) continue;

			const { output, previousOutput } = await processWorker(
				worker,
				i,
				workerContexts,
				previousOutputs,
				currentInput,
				maxTokens
			);

			currentInput = output;
			previousOutputs.push(previousOutput);
		}

		// Handle the last worker - stream if requested
		const lastWorkerInfo = workerInfo[workerInfo.length - 1];
		if (!lastWorkerInfo) {
			throw new Error("No workers available");
		}

		return await processFinalWorker(
			lastWorkerInfo,
			workerInfo.length - 1,
			workerContexts,
			previousOutputs,
			currentInput,
			{ maxTokens, stream }
		);
	}) as AgentFunction;
}

export type { AgentOptions } from "./types";

