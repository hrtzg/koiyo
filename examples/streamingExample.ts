import { agent, worker } from "../src/index";
import { openai } from "../src/models";

// Create workers
const planner = worker()
	.use(openai("gpt-4o-mini"))
	.context("Create a brief plan.");

const executor = worker()
	.use(openai("gpt-4o-mini"))
	.context("Execute the plan. Keep responses brief.");

// Create agent
const app = agent(planner, executor);

// Use agent
const streamResponse = await app("Say hello in one sentence.", { stream: true });

for await (const chunk of streamResponse) {
	process.stdout.write(chunk);
}
