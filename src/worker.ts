import type { ModelAdapter } from "./models/adapter";
import { assertNonEmptyString, assertModelAdapter } from "./utils";

/**
 * Worker class that configures a model adapter and context for agent orchestration
 */
export class Worker<I = unknown, O = unknown> {
	private modelAdapter?: ModelAdapter;
	private workerContext?: string;

	/**
	 * Set the model adapter to use
	 * @param modelFactory - A function that returns a ModelAdapter instance
	 * @throws {Error} If the model factory returns null or undefined
	 */
	public model(modelFactory: () => ModelAdapter): this {
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
	public context(context: string): this {
		assertNonEmptyString(context, "Worker context");
		this.workerContext = context;
		return this;
	}

	/**
	 * Get the model adapter (for agent orchestration)
	 * @returns The model adapter instance
	 * @throws {Error} If no model adapter is configured
	 */
	public getModelAdapter(): ModelAdapter {
		assertModelAdapter(this.modelAdapter, "Worker model");
		return this.modelAdapter;
	}

	/**
	 * Get the base context (for agent orchestration)
	 * @returns The worker's base context string, or undefined if not set
	 */
	public getBaseContext(): string | undefined {
		return this.workerContext;
	}
}

/**
 * Factory function to create a new Worker instance
 * @returns A new Worker instance with generic input/output types
 */
export function worker<I = unknown, O = unknown>(): Worker<I, O> {
	return new Worker<I, O>();
}
