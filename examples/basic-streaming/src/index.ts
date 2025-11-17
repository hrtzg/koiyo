import { openai } from '@ai-sdk/openai';
import { Agent, Worker } from '@koiyo/core';

const agent = new Agent([
	new Worker()
		.model(openai('gpt-4o-mini'))
		.instructions(
			'You are a data extractor. Take the information given and turn it into a math equation, nothing else.'
		),
	new Worker()
		.model(openai('gpt-4o-mini'))
		.instructions(
			'You are a math prodigy. Solve the equation and return nothing but the answer.'
		),
]);

const result = await agent.generate(
	'Can you help me solve 4 and 2 added together?',
	{ stream: true }
);

for await (const chunk of result) {
	process.stdout.write(chunk);
}

console.log('\n');
