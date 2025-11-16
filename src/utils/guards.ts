import type { Worker } from "../worker";
import type { ModelAdapter } from "../models/adapter";

/**
 * Type guard to check if a value is a Worker instance
 */
export function isWorker(value: unknown): value is Worker {
	return (
		value !== null &&
		typeof value === "object" &&
		"model" in value &&
		typeof (value as Worker).model === "function" &&
		"context" in value &&
		typeof (value as Worker).context === "function" &&
		"getModelAdapter" in value &&
		typeof (value as Worker).getModelAdapter === "function" &&
		"getBaseContext" in value &&
		typeof (value as Worker).getBaseContext === "function"
	);
}

/**
 * Type guard to check if a value is a ModelAdapter instance
 */
export function isModelAdapter(value: unknown): value is ModelAdapter {
	return (
		value !== null &&
		typeof value === "object" &&
		"generate" in value &&
		typeof (value as ModelAdapter).generate === "function"
	);
}

/**
 * Type guard to check if a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
	return typeof value === "string" && value.trim().length > 0;
}

/**
 * Type guard to check if a value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
	return value !== null && value !== undefined;
}

