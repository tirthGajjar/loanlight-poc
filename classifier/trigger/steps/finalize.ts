import { GetObjectCommand } from "@aws-sdk/client-s3";
import { PDFDocument } from "pdf-lib";
import { db } from "@/server/db";
import { S3_BUCKET, s3, uploadToS3 } from "@/server/s3";

const MAX_CONCURRENCY = 10;
const RETRY_ATTEMPTS = 5;
const RETRY_BASE_MS = 1_000;
const RETRY_MAX_MS = 30_000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface SegmentInfo {
	id: string;
	segmentIndex: number;
	pageStart: number;
	pageEnd: number;
	subtype: string | null;
}

/** Build suggested filename: zero-padded index + uppercase subtype. */
function buildFilename(segmentIndex: number, subtype: string | null): string {
	const idx = String(segmentIndex).padStart(3, "0");
	const label = subtype ? subtype.toUpperCase() : "UNKNOWN";
	return `${idx}_${label}.pdf`;
}

/** Compute exponential backoff delay with 10% jitter. */
function backoffDelay(attempt: number): number {
	const base = Math.min(RETRY_BASE_MS * 2 ** attempt, RETRY_MAX_MS);
	return base + Math.random() * base * 0.1;
}

// ---------------------------------------------------------------------------
// PDF extraction
// ---------------------------------------------------------------------------

/** Extract pages from source PDF into a new single-segment PDF. */
async function extractPages(
	sourcePdf: PDFDocument,
	pageStart: number,
	pageEnd: number,
): Promise<Uint8Array> {
	const output = await PDFDocument.create();
	// Schema pages are 1-based inclusive; pdf-lib uses 0-based indices
	const indices = Array.from(
		{ length: pageEnd - pageStart + 1 },
		(_, i) => pageStart - 1 + i,
	);
	const pages = await output.copyPages(sourcePdf, indices);
	for (const page of pages) {
		output.addPage(page);
	}
	return output.save();
}

// ---------------------------------------------------------------------------
// Per-segment finalization with retry
// ---------------------------------------------------------------------------

/** Upload extracted PDF to S3 and update the segment record. */
async function uploadAndSave(
	segment: SegmentInfo,
	pdfBytes: Uint8Array,
	loanId: string,
	jobId: string,
): Promise<void> {
	const filename = buildFilename(segment.segmentIndex, segment.subtype);
	const outputKey = `outputs/${loanId}/${jobId}/${filename}`;

	await uploadToS3(outputKey, pdfBytes, "application/pdf");

	await db.classificationSegment.update({
		where: { id: segment.id },
		data: { outputFileKey: outputKey, suggestedFilename: filename },
	});

	console.log(
		`[finalize] Segment ${segment.id}: uploaded ${filename} (${pdfBytes.length} bytes)`,
	);
}

/** Finalize a single segment with retry. */
async function finalizeSegment(
	segment: SegmentInfo,
	sourcePdf: PDFDocument,
	loanId: string,
	jobId: string,
): Promise<void> {
	const pdfBytes = await extractPages(
		sourcePdf,
		segment.pageStart,
		segment.pageEnd,
	);

	let lastError: Error | null = null;

	for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
		try {
			await uploadAndSave(segment, pdfBytes, loanId, jobId);
			return;
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));
			if (attempt < RETRY_ATTEMPTS - 1) {
				const delay = backoffDelay(attempt);
				console.warn(
					`[finalize] Segment ${segment.id} attempt ${attempt + 1} failed, retrying in ${Math.round(delay)}ms: ${lastError.message}`,
				);
				await new Promise((r) => setTimeout(r, delay));
			}
		}
	}

	console.error(
		`[finalize] Segment ${segment.id} failed after ${RETRY_ATTEMPTS} attempts: ${lastError?.message}`,
	);
	throw lastError ?? new Error("Finalization failed after retries");
}

// ---------------------------------------------------------------------------
// Concurrency-limited parallel execution
// ---------------------------------------------------------------------------

async function mapWithConcurrency<T>(
	items: readonly T[],
	fn: (item: T) => Promise<void>,
	concurrency: number,
): Promise<void> {
	const queue = items.entries();
	const workers = Array.from(
		{ length: Math.min(concurrency, items.length) },
		async () => {
			for (const [, item] of queue) {
				await fn(item);
			}
		},
	);
	await Promise.all(workers);
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/** Extract individual PDFs for all completed segments and upload to S3. */
export async function finalizeSegments(jobId: string): Promise<void> {
	const segments = await db.classificationSegment.findMany({
		select: {
			id: true,
			segmentIndex: true,
			pageStart: true,
			pageEnd: true,
			subtype: true,
		},
		where: { jobId, status: "COMPLETED" },
		orderBy: { segmentIndex: "asc" },
	});

	if (segments.length === 0) {
		console.log(`[finalize] Job ${jobId}: no completed segments to finalize`);
		return;
	}

	console.log(
		`[finalize] Job ${jobId}: extracting ${segments.length} segments (concurrency: ${MAX_CONCURRENCY})`,
	);

	// Load job + loan info for S3 key construction
	const job = await db.classificationJob.findUniqueOrThrow({
		select: { loanId: true, sourceFileKey: true },
		where: { id: jobId },
	});

	// Download source PDF once
	const res = await s3.send(
		new GetObjectCommand({ Bucket: S3_BUCKET, Key: job.sourceFileKey }),
	);
	if (!res.Body) throw new Error("Empty S3 response body");
	const fileBytes = await res.Body.transformToByteArray();
	const sourcePdf = await PDFDocument.load(fileBytes);

	console.log(
		`[finalize] Job ${jobId}: loaded source PDF (${sourcePdf.getPageCount()} pages)`,
	);

	// Extract and upload all segments with bounded concurrency
	await mapWithConcurrency(
		segments,
		(segment) => finalizeSegment(segment, sourcePdf, job.loanId, jobId),
		MAX_CONCURRENCY,
	);

	console.log(
		`[finalize] Job ${jobId}: done — ${segments.length} segments extracted`,
	);
}
