import type { GenerateOptions } from "../models/adapter";
import type { WorkerInfo, PreviousOutput, WorkerContext } from "./types";
import { buildEnhancedContext } from "./context";
import { isStream } from "../stream";

/**
 * Convert input to string prompt
 */
function inputToPrompt(input: unknown): string {
	return typeof input === "string" ? input : JSON.stringify(input, null, 2);
}

/**
 * Parse result, attempting JSON first, then falling back to string
 */
function parseResult(result: string): unknown {
	try {
		return JSON.parse(result);
	} catch {
		return result;
	}
}

/**
 * Process a single worker (non-final)
 */
export async function processWorker(
	workerInfo: WorkerInfo,
	workerIndex: number,
	workerContexts: readonly WorkerContext[],
	previousOutputs: readonly PreviousOutput[],
	currentInput: unknown,
	maxTokens?: number
): Promise<{ output: unknown; previousOutput: PreviousOutput }> {
	const { context: baseContext, modelAdapter } = workerInfo;

	// Build enhanced context
	const enhancedContext = buildEnhancedContext(
		workerIndex,
		workerContexts,
		previousOutputs,
		baseContext
	);

	// Convert input to string prompt
	const prompt = inputToPrompt(currentInput);

	// Prepare generation options
	const generateOptions: GenerateOptions = {};
	if (maxTokens !== undefined) {
		generateOptions.maxTokens = maxTokens;
	}

	// Generate response from model adapter
	const result = await modelAdapter.generate(
		prompt,
		enhancedContext,
		generateOptions
	);

	// Process the result
	if (typeof result !== "string") {
		throw new Error("Unexpected streaming result from non-final worker");
	}

	const output = parseResult(result);
	const previousOutput: PreviousOutput = {
		index: workerIndex,
		output: result,
		context: baseContext,
	};

	return { output, previousOutput };
}

/**
 * Process the final worker (may stream)
 */
export async function processFinalWorker(
	workerInfo: WorkerInfo,
	workerIndex: number,
	workerContexts: readonly WorkerContext[],
	previousOutputs: readonly PreviousOutput[],
	currentInput: unknown,
	options: { maxTokens?: number; stream?: boolean }
): Promise<string | AsyncIterable<string>> {
	const { context: baseContext, modelAdapter } = workerInfo;

	// Build enhanced context
	const enhancedContext = buildEnhancedContext(
		workerIndex,
		workerContexts,
		previousOutputs,
		baseContext
	);

	// Convert input to string prompt
	const prompt = inputToPrompt(currentInput);

	// Prepare generation options
	const generateOptions: GenerateOptions = {};
	if (options.maxTokens !== undefined) {
		generateOptions.maxTokens = options.maxTokens;
	}
	if (options.stream !== undefined) {
		generateOptions.stream = options.stream;
	}

	// Generate response from model adapter
	const result = await modelAdapter.generate(
		prompt,
		enhancedContext,
		generateOptions
	);

	// Handle streaming
	if (options.stream && isStream(result)) {
		return result;
	}

	// Handle non-streaming result
	if (typeof result !== "string") {
		throw new Error(
			"Expected string result from model, but received streaming result"
		);
	}

	// Try to parse as JSON, fallback to string
	const parsed = parseResult(result);
	return typeof parsed === "string" ? parsed : JSON.stringify(parsed);
}
