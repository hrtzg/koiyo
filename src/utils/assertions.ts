import type { ModelAdapter } from "../models/adapter";
import type { Worker } from "../worker";
import {
	isNonEmptyString,
	isDefined,
	isWorker,
	isModelAdapter,
} from "./guards";

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
