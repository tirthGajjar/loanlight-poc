import { GetObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/server/db";
import { llamacloud, withLlamaCloudError } from "@/server/llamacloud";
import { S3_BUCKET, s3 } from "@/server/s3";

/** Download PDF from S3, upload to LlamaCloud Files API. Returns file ID. */
export async function ingestDocument(jobId: string): Promise<string> {
	const job = await db.classificationJob.findUniqueOrThrow({
		select: { metadata: true, sourceFileKey: true, sourceFileName: true },
		where: { id: jobId },
	});

	// Download from S3
	let fileBytes: Uint8Array;
	try {
		const res = await s3.send(
			new GetObjectCommand({ Bucket: S3_BUCKET, Key: job.sourceFileKey }),
		);
		if (!res.Body) throw new Error("Empty response body");
		fileBytes = await res.Body.transformToByteArray();
	} catch (error) {
		const msg = error instanceof Error ? error.message : String(error);
		throw new Error(`S3 download failed for "${job.sourceFileKey}": ${msg}`);
	}

	// Upload to LlamaCloud with purpose "split"
	const file = new File([Buffer.from(fileBytes)], job.sourceFileName, {
		type: "application/pdf",
	});

	const llamaFile = await withLlamaCloudError("file upload", () =>
		llamacloud.files.create({ file, purpose: "split" }),
	);

	// Persist LlamaCloud file ID in job metadata
	const meta = (job.metadata ?? {}) as Record<string, unknown>;
	await db.classificationJob.update({
		data: { metadata: { ...meta, llamaFileId: llamaFile.id } },
		where: { id: jobId },
	});

	console.log(
		`[ingest] Uploaded "${job.sourceFileName}" → LlamaCloud file ${llamaFile.id}`,
	);

	return llamaFile.id;
}
