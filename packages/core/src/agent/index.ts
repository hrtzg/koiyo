import type { Worker } from '../worker';
import type { GenerateOptions } from './generate';
import { WorkerChain } from './workerChain';

export interface AgentInternalOptions {
	workers: Worker[];
}

export class Agent {
	private readonly __agent: AgentInternalOptions;

	public constructor(workers: Worker[]);
	public constructor(...workers: Worker[]);
	public constructor(
		workersOrFirst?: Worker | Worker[],
		...restWorkers: Worker[]
	) {
		this.__agent = {
			workers: Array.isArray(workersOrFirst)
				? workersOrFirst
				: workersOrFirst !== undefined
					? [workersOrFirst, ...restWorkers]
					: [],
		};
	}

	public async generate(
		prompt: string,
		options?: GenerateOptions & { stream?: false }
	): Promise<string>;
	public async generate(
		prompt: string,
		options: GenerateOptions & { stream: true }
	): Promise<ReadableStream<string>>;
	public async generate(
		prompt: string,
		options?: GenerateOptions
	): Promise<string | ReadableStream<string>> {
		const chain = new WorkerChain(this.__agent.workers, prompt);
		return chain.execute({ stream: options?.stream ?? false });
	}
}
