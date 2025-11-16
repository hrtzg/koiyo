import type { Worker } from "../worker";

/**
 * Options for agent execution
 */
export interface AgentOptions {
	/** Maximum number of tokens to generate per worker */
	readonly maxTokens?: number;
	/** Whether to stream the final worker's response */
	readonly stream?: boolean;
}

/**
 * Worker information extracted for agent orchestration
 */
export interface WorkerInfo {
	readonly index: number;
	readonly context: string;
	readonly modelAdapter: ReturnType<Worker["getModelAdapter"]>;
}

/**
 * Worker context information for diagram generation
 */
export interface WorkerContext {
	readonly index: number;
	readonly context: string;
}

/**
 * Previous worker output for execution history
 */
export interface PreviousOutput {
	readonly index: number;
	readonly output: string;
	readonly context: string;
}

/**
 * Agent function overloads
 */
export interface AgentFunction {
	(input: string, options: { stream: true }): Promise<AsyncIterable<string>>;
	(input: string, options?: { stream?: false }): Promise<string>;
	(input: string, options?: AgentOptions): Promise<
		string | AsyncIterable<string>
	>;
}

