import { agent, worker } from "../src/index";
import { openai } from "../src/models";

// Create workers
const planner = worker()
	.model(openai("gpt-4o-mini"))
	.context("Create a brief plan.");

const executor = worker()
	.model(openai("gpt-4o-mini"))
	.context("Execute the plan. Keep responses brief.");

// Create agent
const app = agent(planner, executor);

// Use agent
const response = await app("Say hello in one sentence.");

console.log(response);
