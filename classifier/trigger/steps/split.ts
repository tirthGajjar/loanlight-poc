import { SPLIT_CATEGORIES } from "@/lib/classification";
import { db } from "@/server/db";
import { llamacloud, withLlamaCloudError } from "@/server/llamacloud";
import type { LlamaSplitSegment } from "@/server/llamacloud-types";
import type { DocumentBucket } from "../../generated/prisma";

/** Load categories from DB (published version) with hardcoded fallback. */
async function loadCategories(jobId: string) {
	const version = await db.categoryDefinitionVersion.findFirst({
		include: { categories: { orderBy: { sortOrder: "asc" } } },
		where: { status: "PUBLISHED" },
	});

	if (version) {
		await db.classificationJob.update({
			data: { definitionVersionId: version.id },
			where: { id: jobId },
		});
		return version.categories.map((c) => ({
			description: c.description,
			name: c.name,
		}));
	}

	return SPLIT_CATEGORIES.map((c) => ({
		description: c.description,
		name: c.name,
	}));
}

/** Map LlamaSplit category name → Prisma DocumentBucket enum. */
const CATEGORY_TO_BUCKET: Record<string, DocumentBucket> = {
	application: "APPLICATION",
	appraisal: "APPRAISAL",
	assets: "ASSETS",
	business: "BUSINESS",
	credit: "CREDIT",
	disclosures: "DISCLOSURES",
	fraud: "FRAUD",
	identity: "IDENTITY",
	income: "INCOME",
	property: "PROPERTY",
	tax_returns: "TAX_RETURNS",
	title: "TITLE",
	uncategorized: "UNKNOWN",
	unknown: "UNKNOWN",
};

/** Convert categorical split confidence ("high"/"medium"/"low") to numeric. */
function confidenceToNumber(level: string): number {
	if (level === "high") return 0.95;
	if (level === "medium") return 0.75;
	return 0.45;
}

/** Persist LlamaSplit segments and update job totalPages atomically. */
async function saveSegments(jobId: string, segments: LlamaSplitSegment[]) {
	const data = segments.map((seg, i) => {
		const pages = [...seg.pages].sort((a, b) => a - b);
		const pageStart = pages.at(0) ?? 0;
		const pageEnd = pages.at(-1) ?? pageStart;
		return {
			bucket: CATEGORY_TO_BUCKET[seg.category] ?? ("UNKNOWN" as DocumentBucket),
			bucketConfidence: confidenceToNumber(seg.confidence_category),
			jobId,
			pageEnd,
			pageStart,
			segmentIndex: i + 1,
		};
	});

	const allPages = segments.flatMap((s) => s.pages);
	const totalPages = Math.max(...allPages);

	await db.$transaction([
		db.classificationSegment.createMany({ data }),
		db.classificationJob.update({
			data: { totalPages },
			where: { id: jobId },
		}),
	]);
}

/** Create a LlamaSplit job, poll until done, save segments to DB. */
export async function splitDocument(jobId: string): Promise<void> {
	const job = await db.classificationJob.findUniqueOrThrow({
		select: { metadata: true },
		where: { id: jobId },
	});

	const meta = (job.metadata ?? {}) as Record<string, unknown>;
	const fileId = meta.llamaFileId as string;
	if (!fileId) throw new Error("Missing llamaFileId in job metadata");

	const categories = await loadCategories(jobId);

	const splitJob = await withLlamaCloudError("split job creation", () =>
		llamacloud.beta.split.create({
			categories,
			document_input: { type: "file_id", value: fileId },
			splitting_strategy: { allow_uncategorized: true },
		}),
	);

	// Store split job ID for debugging
	await db.classificationJob.update({
		data: { metadata: { ...meta, llamaSplitJobId: splitJob.id } },
		where: { id: jobId },
	});

	const completed = await withLlamaCloudError("split polling", () =>
		llamacloud.beta.split.waitForCompletion(splitJob.id, {
			maxInterval: 5,
			pollingInterval: 3,
			timeout: 300,
		}),
	);

	if (completed.status === "failed") {
		throw new Error(
			`LlamaSplit failed: ${completed.error_message ?? "unknown error"}`,
		);
	}

	const segments = completed.result?.segments ?? [];
	console.log(`[split] Job ${jobId}: ${segments.length} segments found`);

	if (segments.length > 0) {
		await saveSegments(jobId, segments);
	}
}
