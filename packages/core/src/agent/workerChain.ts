import type { Worker } from '../worker';
import { generate } from './generate';

export interface WorkerExecutionState {
	currentIndex: number;
	input: string;
	workers: Worker[];
}

export class WorkerChain {
	private readonly state: WorkerExecutionState;

	public constructor(workers: Worker[], initialInput: string) {
		if (workers.length === 0) {
			throw new Error('No workers available');
		}

		this.state = {
			currentIndex: 0,
			input: initialInput,
			workers,
		};
	}

	/**
	 * Get the current worker
	 */
	public getCurrentWorker(): Worker | null {
		return this.state.workers[this.state.currentIndex] ?? null;
	}

	/**
	 * Get the worker at a specific index
	 */
	public getWorker(index: number): Worker | null {
		return this.state.workers[index] ?? null;
	}

	/**
	 * Get the current index
	 */
	public get currentIndex(): number {
		return this.state.currentIndex;
	}

	/**
	 * Get the total number of workers
	 */
	public get workerCount(): number {
		return this.state.workers.length;
	}

	/**
	 * Check if there is a next worker
	 */
	public get hasNext(): boolean {
		return this.state.currentIndex < this.state.workers.length - 1;
	}

	/**
	 * Check if there is a previous worker
	 */
	public get hasPrevious(): boolean {
		return this.state.currentIndex > 0;
	}

	/**
	 * Check if we're at the last worker
	 */
	public get isLast(): boolean {
		return this.state.currentIndex === this.state.workers.length - 1;
	}

	/**
	 * Check if we're at the first worker
	 */
	public get isFirst(): boolean {
		return this.state.currentIndex === 0;
	}

	/**
	 * Get the current input
	 */
	public get input(): string {
		return this.state.input;
	}

	/**
	 * Set the input for the next worker
	 */
	public set input(input: string) {
		this.state.input = input;
	}

	/**
	 * Move to the next worker
	 */
	public nextWorker(): this {
		if (!this.hasNext) {
			throw new Error('No next worker available');
		}
		this.state.currentIndex++;
		return this;
	}

	/**
	 * Move to the previous worker
	 */
	public previousWorker(): this {
		if (!this.hasPrevious) {
			throw new Error('No previous worker available');
		}
		this.state.currentIndex--;
		return this;
	}

	/**
	 * Move to a specific worker by index
	 */
	public toWorker(index: number): this {
		if (index < 0 || index >= this.state.workers.length) {
			throw new Error(`Invalid worker index: ${String(index)}`);
		}
		this.state.currentIndex = index;
		return this;
	}

	/**
	 * Execute the current worker (non-streaming)
	 */
	public async executeCurrent(options?: {
		instructions?: string;
	}): Promise<string> {
		const worker = this.getCurrentWorker();
		if (!worker) {
			throw new Error(
				`No worker available at index ${String(this.state.currentIndex)}`
			);
		}

		const languageModel = worker.languageModel;
		if (!languageModel) {
			throw new Error(
				`No language model configured for worker at index ${String(this.state.currentIndex)}`
			);
		}

		const output = await generate(languageModel, this.state.input, {
			instructions: options?.instructions ?? worker.getInstructions(),
		});

		if (typeof output !== 'string') {
			throw new Error('Unexpected streaming result from worker');
		}

		this.state.input = output;
		return output;
	}

	/**
	 * Execute the current worker (streaming, only for last worker)
	 */
	public async executeCurrentStreaming(options?: {
		instructions?: string;
	}): Promise<ReadableStream<string>> {
		const worker = this.getCurrentWorker();
		if (!worker) {
			throw new Error(
				`No worker available at index ${String(this.state.currentIndex)}`
			);
		}

		const languageModel = worker.languageModel;
		if (!languageModel) {
			throw new Error(
				`No language model configured for worker at index ${String(this.state.currentIndex)}`
			);
		}

		return generate(languageModel, this.state.input, {
			stream: true,
			instructions: options?.instructions ?? worker.getInstructions(),
		});
	}

	/**
	 * Execute all remaining workers sequentially
	 */
	public async execute(options?: {
		stream?: boolean;
	}): Promise<string | ReadableStream<string>> {
		// Execute all workers except the last one
		while (this.hasNext) {
			await this.executeCurrent();
			this.nextWorker();
		}

		// Execute the last worker (may stream if requested)
		if (options?.stream) {
			return await this.executeCurrentStreaming();
		}

		return await this.executeCurrent();
	}
}
