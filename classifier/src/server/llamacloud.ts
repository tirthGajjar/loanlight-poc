import { LlamaCloud, LlamaCloudError } from "@llamaindex/llama-cloud";
import { env } from "@/env";

const TIMEOUT_MS = 1_800_000; // 30 min — LlamaCloud processing can be slow for large PDFs

const createLlamaCloudClient = () =>
	new LlamaCloud({
		apiKey: env.LLAMACLOUD_API_KEY,
		timeout: TIMEOUT_MS,
		maxRetries: 2,
	});

const globalForLlamaCloud = globalThis as unknown as {
	llamacloud: ReturnType<typeof createLlamaCloudClient> | undefined;
};

export const llamacloud =
	globalForLlamaCloud.llamacloud ?? createLlamaCloudClient();

if (env.NODE_ENV !== "production") globalForLlamaCloud.llamacloud = llamacloud;

/** Wraps a LlamaCloud SDK call with a user-friendly error message. */
export async function withLlamaCloudError<T>(
	operation: string,
	fn: () => Promise<T>,
): Promise<T> {
	try {
		return await fn();
	} catch (error) {
		if (error instanceof LlamaCloudError) {
			throw new Error(`LlamaCloud ${operation} failed: ${error.message}`);
		}
		throw error;
	}
}

export { LlamaCloudError };
