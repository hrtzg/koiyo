import { agent, worker } from "../src/index";
import { openai } from "../src/models";

// Create workers
const planner = worker()
	.model(openai("gpt-4o-mini"))
	.context("Create a brief plan for the executor to fulfill the request.");

const executor = worker()
	.model(openai("gpt-4o-mini"))
	.context("Execute the plan exactly as instructed.");

// Create agent
const app = agent(planner, executor);

// Use agent
const streamResponse = await app("Say the word hello 10x.", {
	stream: true,
});

for await (const chunk of streamResponse) {
	process.stdout.write(chunk);
}
