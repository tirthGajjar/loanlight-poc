import { task } from "@trigger.dev/sdk";
import { db } from "@/server/db";
import type { JobStatus } from "../generated/prisma";
import { classifySegments } from "./steps/classify";
import { finalizeSegments } from "./steps/finalize";
import { ingestDocument } from "./steps/ingest";
import { splitDocument } from "./steps/split";

/** Update job status and set timing milestones as appropriate. */
async function updateJobStatus(jobId: string, status: JobStatus) {
	const startedAt = status === "INGESTING" ? new Date() : undefined;
	const completedAt =
		status === "COMPLETED" || status === "FAILED" ? new Date() : undefined;

	await db.classificationJob.update({
		where: { id: jobId },
		data: { completedAt, startedAt, status },
	});
	console.log(`[process-document] Job ${jobId} → ${status}`);
}

/** Record a failure in the DB, swallowing DB errors to avoid masking the original. */
async function markJobFailed(jobId: string, error: unknown) {
	const message = error instanceof Error ? error.message : String(error);
	try {
		await db.classificationJob.update({
			where: { id: jobId },
			data: {
				completedAt: new Date(),
				errorMessage: message,
				status: "FAILED",
			},
		});
	} catch {
		console.error(`[process-document] Could not persist failure for ${jobId}`);
	}
	console.error(`[process-document] Job ${jobId} failed: ${message}`);
}

export const processDocumentTask = task({
	id: "process-document",
	maxDuration: 1800,
	machine: "medium-1x",
	run: async (payload: {
		jobId: string;
		fromStep?: "CLASSIFYING" | "FINALIZING";
	}) => {
		const { jobId, fromStep } = payload;
		console.log(
			`[process-document] Starting pipeline for job ${jobId}${fromStep ? ` from ${fromStep}` : ""}`,
		);

		try {
			if (!fromStep) {
				// Steps 1-2: Download PDF from S3 + upload to LlamaCloud
				await updateJobStatus(jobId, "INGESTING");
				await ingestDocument(jobId);

				// Step 3: Run LlamaSplit to identify document segments
				await updateJobStatus(jobId, "SPLITTING");
				await splitDocument(jobId);
			}

			if (!fromStep || fromStep === "CLASSIFYING") {
				// Step 4: Classify each segment with LlamaClassify
				await updateJobStatus(jobId, "CLASSIFYING");
				await classifySegments(jobId);
			}

			// Step 5: Extract individual PDFs and upload to S3
			await updateJobStatus(jobId, "FINALIZING");
			await finalizeSegments(jobId);

			await updateJobStatus(jobId, "COMPLETED");
			return { jobId, status: "COMPLETED" as const };
		} catch (error) {
			await markJobFailed(jobId, error);
			throw error;
		}
	},
});
