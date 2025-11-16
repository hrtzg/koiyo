import type { Worker } from "./worker";
import type { ModelAdapter } from "./models/adapter";

/**
 * Type guard to check if a value is a Worker instance
 * @param value - The value to check
 * @returns True if the value is a Worker instance, false otherwise
 */
export function isWorker(value: unknown): value is Worker {
	return (
		value !== null &&
		typeof value === "object" &&
		"process" in value &&
		typeof (value as Worker).process === "function" &&
		"model" in value &&
		typeof (value as Worker).model === "function"
	);
}

/**
 * Type guard to check if a value is a ModelAdapter instance
 * @param value - The value to check
 * @returns True if the value is a ModelAdapter instance, false otherwise
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
 * @param value - The value to check
 * @returns True if the value is a non-empty string, false otherwise
 */
export function isNonEmptyString(value: unknown): value is string {
	return typeof value === "string" && value.trim().length > 0;
}

/**
 * Type guard to check if a value is defined (not null or undefined)
 * @param value - The value to check
 * @returns True if the value is not null or undefined, false otherwise
 */
export function isDefined<T>(value: T | null | undefined): value is T {
	return value !== null && value !== undefined;
}

/**
 * Validates that a value is a non-empty string, throwing an error if not
 * @param value - The value to validate
 * @param name - The name of the parameter for error messages
 * @throws {Error} If the value is not a non-empty string
 */
export function assertNonEmptyString(
	value: unknown,
	name: string = "value"
): asserts value is string {
	if (!isNonEmptyString(value)) {
		throw new Error(
			`${name} must be a non-empty string. Received ${
				typeof value === "string" ? "empty string" : typeof value
			}.`
		);
	}
}

/**
 * Validates that a value is defined (not null or undefined), throwing an error if not
 * @param value - The value to validate
 * @param name - The name of the parameter for error messages
 * @throws {Error} If the value is null or undefined
 */
export function assertDefined<T>(
	value: T | null | undefined,
	name: string = "value"
): asserts value is T {
	if (!isDefined(value)) {
		throw new Error(
			`${name} cannot be null or undefined. Provide a valid ${name}.`
		);
	}
}

/**
 * Validates that a value is a Worker instance, throwing an error if not
 * @param value - The value to validate
 * @param name - The name of the parameter for error messages
 * @throws {Error} If the value is not a Worker instance
 */
export function assertWorker(
	value: unknown,
	name: string = "worker"
): asserts value is Worker {
	if (!isWorker(value)) {
		throw new Error(
			`${name} must be a valid Worker instance. Received ${typeof value}.`
		);
	}
}

/**
 * Validates that a value is a ModelAdapter instance, throwing an error if not
 * @param value - The value to validate
 * @param name - The name of the parameter for error messages
 * @throws {Error} If the value is not a ModelAdapter instance
 */
export function assertModelAdapter(
	value: unknown,
	name: string = "model"
): asserts value is ModelAdapter {
	if (!isModelAdapter(value)) {
		throw new Error(
			`${name} must be a valid ModelAdapter instance. Received ${typeof value}.`
		);
	}
}
