import type { WorkerContext } from "./types";

const BOX_WIDTH = 50;
const MAX_CONTEXT_LENGTH = 45;
const TRUNCATED_LENGTH = 42;

/**
 * Generate a visual diagram of the agent process
 */
export function generateAgentDiagram(
	workerContexts: readonly WorkerContext[]
): string {
	const lines: string[] = ["📊 Agent Process Flow", ""];

	for (const { index, context } of workerContexts) {
		const workerNum = index + 1;
		const isLast = index === workerContexts.length - 1;
		const displayContext = context || "No context set";

		// Truncate long contexts for diagram
		const shortContext =
			displayContext.length > MAX_CONTEXT_LENGTH
				? `${displayContext.substring(0, TRUNCATED_LENGTH)}...`
				: displayContext;

		const workerLabel = `Worker ${workerNum}`;
		const padding = BOX_WIDTH - workerLabel.length - 4;

		lines.push(
			`┌─ ${workerLabel} ${"─".repeat(Math.max(0, padding))}┐`,
			`│ ${shortContext.padEnd(BOX_WIDTH - 2)} │`,
			`└${"─".repeat(BOX_WIDTH)}┘`
		);

		if (!isLast) {
			lines.push("         ⬇");
		}
	}

	return lines.join("\n");
}
