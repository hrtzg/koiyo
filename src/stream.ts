import { assertDefined } from "./utils";

/**
 * Type guard to check if a value is an AsyncIterable stream
 * @param value - The value to check
 * @returns True if the value is an AsyncIterable<string>, false otherwise
 */
export function isStream(value: unknown): value is AsyncIterable<string> {
	return (
		value !== null && typeof value === "object" && Symbol.asyncIterator in value
	);
}

/**
 * Collect all chunks from an async iterable stream into a single string
 * @param stream - The async iterable stream to collect
 * @returns A promise that resolves to the concatenated string of all stream chunks
 * @throws {Error} If the stream is null or undefined
 */
export async function collectStream(
	stream: AsyncIterable<string>
): Promise<string> {
	assertDefined(stream, "Stream");
	let result = "";
	for await (const chunk of stream) {
		result += chunk;
	}
	return result;
}

/**
 * Alias for collectStream - collects all chunks from an async iterable stream into a single string
 * @param stream - The async iterable stream to collect
 * @returns A promise that resolves to the concatenated string of all stream chunks
 */
export const streamToString = collectStream;
