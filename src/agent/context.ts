import type { WorkerContext, PreviousOutput } from "./types";
import { generateAgentDiagram } from "./diagram";

const MAX_OUTPUT_PREVIEW_LENGTH = 150;

/**
 * Build enhanced context for a worker with information about previous and next workers
 */
export function buildEnhancedContext(
	workerIndex: number,
	workerContexts: readonly WorkerContext[],
	previousOutputs: readonly PreviousOutput[],
	baseContext: string
): string {
	const parts: string[] = [];

	// Add the agent process diagram
	parts.push("📊 Agent Process Flow", generateAgentDiagram(workerContexts), "");

	// Add information about what ran before
	parts.push("📜 Execution History");
	if (previousOutputs.length === 0) {
		parts.push(
			"You are the first worker in the chain.",
			"No previous workers have executed."
		);
	} else {
		parts.push(
			`You are Worker ${workerIndex + 1} of ${workerContexts.length}.`,
			""
		);
		for (const prev of previousOutputs) {
			parts.push(`Worker ${prev.index + 1}: "${prev.context}"`);
			const outputPreview =
				prev.output.length > MAX_OUTPUT_PREVIEW_LENGTH
					? `${prev.output.substring(0, MAX_OUTPUT_PREVIEW_LENGTH)}...`
					: prev.output;
			parts.push(`  → ${outputPreview}`, "");
		}
	}
	parts.push("");

	// Add information about what will run after
	parts.push("🔮 Upcoming Workers");
	if (workerIndex === workerContexts.length - 1) {
		parts.push(
			"You are the final worker in the chain.",
			"No workers will execute after you."
		);
	} else {
		parts.push(
			`After you complete, ${
				workerContexts.length - workerIndex - 1
			} worker(s) will execute:`,
			""
		);
		for (let i = workerIndex + 1; i < workerContexts.length; i++) {
			const next = workerContexts[i];
			if (!next) continue;
			const isLast = i === workerContexts.length - 1;
			parts.push(
				`  ${isLast ? "└─" : "├─"} Worker ${i + 1}${
					isLast ? " (FINAL)" : ""
				}: "${next.context}"`
			);
		}
	}
	parts.push("");

	// Add the base context
	parts.push("🎯 Your Task", baseContext);

	return parts.join("\n");
}
