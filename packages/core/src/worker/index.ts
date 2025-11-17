import type { LanguageModel } from '../languageModel';

export interface WorkerInternalOptions {
	languageModel?: LanguageModel;
	instructions?: string;
}

export class Worker {
	private readonly __worker: WorkerInternalOptions;

	public constructor() {
		this.__worker = {
			languageModel: undefined,
			instructions: undefined,
		};
	}

	public model(model: LanguageModel): this {
		this.__worker.languageModel = model;
		return this;
	}

	public instructions(instructions: string): this {
		this.__worker.instructions = instructions;
		return this;
	}

	/**
	 * Get the language model configured for this worker
	 * @internal
	 */
	public get languageModel(): LanguageModel | undefined {
		return this.__worker.languageModel;
	}

	/**
	 * Get the instructions configured for this worker
	 * @internal
	 */
	public getInstructions(): string | undefined {
		return this.__worker.instructions;
	}
}
