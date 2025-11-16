/**
 * Options for generating model responses
 */
export interface GenerateOptions {
	/** Maximum number of tokens to generate */
	maxTokens?: number;
	/** Whether to stream the response as it's generated */
	stream?: boolean;
}

/**
 * Generic model adapter interface for AI models
 * Implement this interface to add support for new AI model providers
 */
export interface ModelAdapter {
	/**
	 * Generate a response from the model
	 * @param prompt - The input prompt
	 * @param context - Optional context to include in the prompt
	 * @param options - Optional generation options
	 * @returns The model's response (string if not streaming, AsyncIterable<string> if streaming)
	 */
	generate(
		prompt: string,
		context?: string,
		options?: GenerateOptions
	): Promise<string | AsyncIterable<string>>;
}
