import { GetObjectCommand } from "@aws-sdk/client-s3";
import type { ClassificationRule } from "@/lib/classification";
import {
	CLASSIFICATION_RULES,
	ENCOMPASS_FOLDER_MAP,
	getConfidenceLevel,
} from "@/lib/classification";
import { db } from "@/server/db";
import { llamacloud, withLlamaCloudError } from "@/server/llamacloud";
import { S3_BUCKET, s3 } from "@/server/s3";
import type { DocumentBucket } from "../../generated/prisma";

const MAX_CONCURRENCY = 10;
const RETRY_ATTEMPTS = 5;
const RETRY_BASE_MS = 1_000;
const RETRY_MAX_MS = 30_000;

/** Map Prisma DocumentBucket enum → classification rules key. */
const BUCKET_TO_RULES_KEY: Record<DocumentBucket, string | null> = {
	APPLICATION: "application",
	APPRAISAL: "appraisal",
	ASSETS: "assets",
	BUSINESS: "business",
	CREDIT: "credit",
	DISCLOSURES: "disclosures",
	FRAUD: "fraud",
	IDENTITY: "identity",
	INCOME: "income",
	PROPERTY: "property",
	TAX_RETURNS: "tax_returns",
	TITLE: "title",
	UNKNOWN: null,
};

// ---------------------------------------------------------------------------
// Rule loading with encompass folder enrichment
// ---------------------------------------------------------------------------

interface SubtypeRule extends ClassificationRule {
	readonly encompassFolder?: string;
}

/**
 * Load all subtype rules grouped by bucket. Prefers DB-defined rules from the
 * published CategoryDefinitionVersion; falls back to hardcoded rules enriched
 * with encompass folder mappings.
 */
async function loadAllRules(
	definitionVersionId: string | null,
): Promise<ReadonlyMap<string, readonly SubtypeRule[]>> {
	const rulesByBucket = new Map<string, readonly SubtypeRule[]>();

	if (definitionVersionId) {
		const categories = await db.categoryDefinition.findMany({
			where: { versionId: definitionVersionId },
			include: { subtypes: { orderBy: { sortOrder: "asc" } } },
		});

		for (const cat of categories) {
			if (cat.subtypes.length > 0) {
				rulesByBucket.set(
					cat.name,
					cat.subtypes.map((s) => ({
						type: s.type,
						description: s.description,
						encompassFolder: s.encompassFolder,
					})),
				);
			}
		}
	}

	// Fill in any buckets not covered by DB rules with hardcoded rules
	for (const [key, rules] of Object.entries(CLASSIFICATION_RULES)) {
		if (!rulesByBucket.has(key)) {
			rulesByBucket.set(
				key,
				rules.map((r) => ({
					...r,
					encompassFolder: ENCOMPASS_FOLDER_MAP[r.type],
				})),
			);
		}
	}

	return rulesByBucket;
}

// ---------------------------------------------------------------------------
// File upload for classify
// ---------------------------------------------------------------------------

/** Upload source PDF to LlamaCloud with purpose "classify". Caches the ID. */
async function uploadForClassify(jobId: string): Promise<string> {
	const job = await db.classificationJob.findUniqueOrThrow({
		select: { metadata: true, sourceFileKey: true, sourceFileName: true },
		where: { id: jobId },
	});

	const meta = (job.metadata ?? {}) as Record<string, unknown>;

	// Reuse if already uploaded for classify
	if (typeof meta.llamaClassifyFileId === "string") {
		return meta.llamaClassifyFileId;
	}

	// Download from S3
	const res = await s3.send(
		new GetObjectCommand({ Bucket: S3_BUCKET, Key: job.sourceFileKey }),
	);
	if (!res.Body) throw new Error("Empty S3 response body");
	const fileBytes = await res.Body.transformToByteArray();

	// Upload to LlamaCloud
	const file = new File([Buffer.from(fileBytes)], job.sourceFileName, {
		type: "application/pdf",
	});
	const llamaFile = await withLlamaCloudError("classify file upload", () =>
		llamacloud.files.create({ file, purpose: "classify" }),
	);

	// Persist for reuse
	await db.classificationJob.update({
		data: { metadata: { ...meta, llamaClassifyFileId: llamaFile.id } },
		where: { id: jobId },
	});

	console.log(
		`[classify] Uploaded "${job.sourceFileName}" → LlamaCloud file ${llamaFile.id}`,
	);
	return llamaFile.id;
}

// ---------------------------------------------------------------------------
// Per-segment classification
// ---------------------------------------------------------------------------

interface SegmentInfo {
	id: string;
	bucket: DocumentBucket | null;
	pageStart: number;
	pageEnd: number;
}

/** Mark a segment as completed with zero confidence, flagged for review. */
async function markForReview(segmentId: string): Promise<void> {
	await db.classificationSegment.update({
		where: { id: segmentId },
		data: {
			status: "COMPLETED",
			confidence: 0,
			confidenceLevel: "LOW",
			requiresReview: true,
			classificationCompletedAt: new Date(),
		},
	});
}

/** Compute exponential backoff delay with 10 % jitter. */
function backoffDelay(attempt: number): number {
	const base = Math.min(RETRY_BASE_MS * 2 ** attempt, RETRY_MAX_MS);
	return base + Math.random() * base * 0.1;
}

/** Build 0-indexed target page array from 1-based inclusive range. */
function buildTargetPages(pageStart: number, pageEnd: number): number[] {
	return Array.from(
		{ length: pageEnd - pageStart + 1 },
		(_, i) => pageStart - 1 + i,
	);
}

/** Max pages per MULTIMODAL classify request (LlamaCloud limit). */
const MULTIMODAL_PAGE_LIMIT = 10;

/** Split an array into chunks of at most `size` elements. */
function chunk<T>(arr: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < arr.length; i += size) {
		chunks.push(arr.slice(i, i + size));
	}
	return chunks;
}

/** Classify a single batch of pages and return the top result. */
async function classifyPages(
	fileId: string,
	targetPages: number[],
	rules: readonly SubtypeRule[],
): Promise<{
	type: string | null;
	confidence: number;
	reasoning: string;
} | null> {
	const results = await withLlamaCloudError("classify", () =>
		llamacloud.classifier.classify(
			{
				file_ids: [fileId],
				rules: rules.map((r) => ({
					type: r.type,
					description: r.description,
				})),
				parsing_configuration: { target_pages: targetPages, max_pages: null },
				mode: "MULTIMODAL",
			},
			{ timeout: 300_000 },
		),
	);
	return results.items[0]?.result ?? null;
}

/** Call LlamaClassify for a single segment and save the result. */
async function callClassifyAndSave(
	segment: SegmentInfo,
	fileId: string,
	rules: readonly SubtypeRule[],
): Promise<void> {
	const targetPages = buildTargetPages(segment.pageStart, segment.pageEnd);
	const batches = chunk(targetPages, MULTIMODAL_PAGE_LIMIT);

	// Classify each batch sequentially, keep the highest-confidence result.
	let best: {
		type: string | null;
		confidence: number;
		reasoning: string;
	} | null = null;

	for (const batch of batches) {
		const result = await classifyPages(fileId, batch, rules);
		if (result && (!best || result.confidence > best.confidence)) {
			best = result;
		}
	}

	if (batches.length > 1 && best) {
		console.log(
			`[classify] Segment ${segment.id}: split into ${batches.length} batches, best confidence ${(best.confidence * 100).toFixed(1)}%`,
		);
	}

	if (!best) {
		await markForReview(segment.id);
		console.log(
			`[classify] Segment ${segment.id}: no result from LlamaClassify`,
		);
		return;
	}

	const { level, requiresReview } = getConfidenceLevel(best.confidence);
	const encompassFolder = best.type
		? (rules.find((r) => r.type === best.type)?.encompassFolder ?? null)
		: null;

	await db.classificationSegment.update({
		where: { id: segment.id },
		data: {
			subtype: best.type,
			confidence: best.confidence,
			reasoning: best.reasoning,
			confidenceLevel: level,
			requiresReview,
			encompassFolder,
			status: "COMPLETED",
			classificationCompletedAt: new Date(),
		},
	});

	console.log(
		`[classify] Segment ${segment.id}: ${best.type} (${(best.confidence * 100).toFixed(1)}%, ${level})`,
	);
}

/** Classify a single segment. Retries with exponential backoff. */
async function classifySegment(
	segment: SegmentInfo,
	fileId: string,
	rules: readonly SubtypeRule[],
): Promise<void> {
	if (rules.length === 0) {
		await markForReview(segment.id);
		console.log(
			`[classify] Segment ${segment.id}: no rules, flagged for review`,
		);
		return;
	}

	await db.classificationSegment.update({
		where: { id: segment.id },
		data: { status: "CLASSIFYING", classificationStartedAt: new Date() },
	});

	let lastError: Error | null = null;

	for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
		try {
			await callClassifyAndSave(segment, fileId, rules);
			return;
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));
			if (attempt < RETRY_ATTEMPTS - 1) {
				const delay = backoffDelay(attempt);
				console.warn(
					`[classify] Segment ${segment.id} attempt ${attempt + 1} failed, retrying in ${Math.round(delay)}ms: ${lastError.message}`,
				);
				await new Promise((r) => setTimeout(r, delay));
			}
		}
	}

	// All retries exhausted
	await db.classificationSegment.update({
		where: { id: segment.id },
		data: {
			status: "FAILED",
			errorMessage: lastError?.message ?? "Classification failed after retries",
			classificationCompletedAt: new Date(),
		},
	});
	console.error(
		`[classify] Segment ${segment.id} failed after ${RETRY_ATTEMPTS} attempts: ${lastError?.message}`,
	);
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

/** Classify all pending segments for a job using LlamaClassify. */
export async function classifySegments(jobId: string): Promise<void> {
	// Reset interrupted/failed segments so they get retried
	await db.classificationSegment.updateMany({
		where: { jobId, status: { in: ["CLASSIFYING", "FAILED"] } },
		data: { status: "PENDING", errorMessage: null },
	});

	const segments = await db.classificationSegment.findMany({
		select: { id: true, bucket: true, pageStart: true, pageEnd: true },
		where: { jobId, status: "PENDING" },
		orderBy: { segmentIndex: "asc" },
	});

	if (segments.length === 0) {
		console.log(`[classify] Job ${jobId}: no segments to classify`);
		return;
	}

	console.log(
		`[classify] Job ${jobId}: classifying ${segments.length} segments (concurrency: ${MAX_CONCURRENCY})`,
	);

	// Pre-load all classification rules (1 query instead of N)
	const job = await db.classificationJob.findUniqueOrThrow({
		select: { definitionVersionId: true },
		where: { id: jobId },
	});
	const rulesByBucket = await loadAllRules(job.definitionVersionId);

	// Upload file to LlamaCloud for classification
	const fileId = await uploadForClassify(jobId);

	// Classify all segments in parallel with bounded concurrency
	await mapWithConcurrency(
		segments,
		(segment) => {
			const rulesKey = segment.bucket
				? BUCKET_TO_RULES_KEY[segment.bucket]
				: null;
			const rules = rulesKey ? (rulesByBucket.get(rulesKey) ?? []) : [];
			return classifySegment(segment, fileId, rules);
		},
		MAX_CONCURRENCY,
	);

	// Report results
	const failed = await db.classificationSegment.count({
		where: { jobId, status: "FAILED" },
	});
	const review = await db.classificationSegment.count({
		where: { jobId, requiresReview: true },
	});

	console.log(
		`[classify] Job ${jobId}: done — ${segments.length} segments, ${failed} failed, ${review} flagged for review`,
	);

	if (failed > 0) {
		throw new Error(
			`${failed} of ${segments.length} segments failed classification`,
		);
	}
}
