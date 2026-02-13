import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { runs, tasks } from "@trigger.dev/sdk";
import { TRPCError } from "@trpc/server";
import { PDFDocument } from "pdf-lib";
import { z } from "zod";

import { ENCOMPASS_FOLDER_MAP } from "@/lib/classification/encompass-map";
import { CLASSIFICATION_RULES } from "@/lib/classification/rules";
import { S3_BUCKET, s3, uploadToS3 } from "@/server/s3";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const createInput = z.object({
	fileName: z.string().min(1),
	fileSizeBytes: z.number().int().positive(),
	loanId: z.string().cuid(),
	s3Key: z.string().min(1),
});

export const jobsRouter = createTRPCRouter({
	create: protectedProcedure
		.input(createInput)
		.mutation(async ({ ctx, input }) => {
			const loan = await ctx.db.loan.findUnique({
				where: { id: input.loanId },
			});
			if (!loan || loan.userId !== ctx.session.user.id) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Loan not found" });
			}

			// Idempotency: return existing job for same S3 key
			const existing = await ctx.db.classificationJob.findFirst({
				where: { sourceFileKey: input.s3Key },
			});
			if (existing) return { jobId: existing.id };

			// Verify file exists in S3
			try {
				await s3.send(
					new HeadObjectCommand({ Bucket: S3_BUCKET, Key: input.s3Key }),
				);
			} catch {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Uploaded file not found in storage",
				});
			}

			const job = await ctx.db.classificationJob.create({
				data: {
					loanId: input.loanId,
					sourceFileKey: input.s3Key,
					sourceFileName: input.fileName,
					sourceSizeBytes: input.fileSizeBytes,
					userId: ctx.session.user.id,
				},
			});

			// Trigger background processing task
			try {
				const handle = await tasks.trigger("process-document", {
					jobId: job.id,
				});
				await ctx.db.classificationJob.update({
					data: { triggerRunId: handle.id },
					where: { id: job.id },
				});
			} catch {
				await ctx.db.classificationJob.update({
					data: {
						completedAt: new Date(),
						errorMessage: "Failed to start processing",
						status: "FAILED",
					},
					where: { id: job.id },
				});
			}

			return { jobId: job.id };
		}),

	dashboardStats: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;
		const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

		const [
			jobsByStatus,
			recentJobCount,
			reviewCount,
			totalPages,
			recentActivity,
		] = await Promise.all([
			ctx.db.classificationJob.groupBy({
				by: ["status"],
				where: { userId },
				// biome-ignore lint/style/useNamingConvention: Prisma API
				_count: true,
			}),

			ctx.db.classificationJob.count({
				where: { userId, createdAt: { gte: sevenDaysAgo } },
			}),

			ctx.db.classificationSegment.count({
				where: { job: { userId }, requiresReview: true },
			}),

			ctx.db.classificationJob.aggregate({
				where: { userId, status: "COMPLETED" },
				// biome-ignore lint/style/useNamingConvention: Prisma API
				_sum: { totalPages: true },
			}),

			ctx.db.classificationJob.findMany({
				where: { userId, status: { in: ["COMPLETED", "FAILED"] } },
				// biome-ignore lint/style/useNamingConvention: Prisma API
				include: { _count: { select: { segments: true } } },
				orderBy: { completedAt: "desc" },
				take: 10,
			}),
		]);

		return {
			jobsByStatus,
			recentActivity,
			recentJobCount,
			reviewCount,
			totalPages: totalPages._sum.totalPages ?? 0,
		};
	}),

	list: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.classificationJob.findMany({
			// biome-ignore lint/style/useNamingConvention: Prisma API
			include: { _count: { select: { segments: true } } },
			orderBy: { createdAt: "desc" },
			where: { userId: ctx.session.user.id },
		});
	}),

	getStatusBatch: protectedProcedure
		.input(z.object({ jobIds: z.array(z.string().cuid()).min(1).max(50) }))
		.query(async ({ ctx, input }) => {
			const jobs = await ctx.db.classificationJob.findMany({
				select: { id: true, status: true },
				where: {
					id: { in: input.jobIds },
					userId: ctx.session.user.id,
				},
			});
			return Object.fromEntries(jobs.map((j) => [j.id, j.status])) as Record<
				string,
				string
			>;
		}),

	getStatus: protectedProcedure
		.input(z.object({ jobId: z.string().cuid() }))
		.query(async ({ ctx, input }) => {
			const job = await ctx.db.classificationJob.findUnique({
				include: { segments: { orderBy: { segmentIndex: "asc" } } },
				where: { id: input.jobId },
			});

			if (!job || job.userId !== ctx.session.user.id) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
			}

			const { segments } = job;
			const bucketCounts: Record<string, number> = {};
			for (const seg of segments) {
				const b = seg.bucket ?? "UNKNOWN";
				bucketCounts[b] = (bucketCounts[b] ?? 0) + 1;
			}

			return {
				...job,
				summary: {
					completedCount: segments.filter((s) => s.status === "COMPLETED")
						.length,
					requiresReviewCount: segments.filter((s) => s.requiresReview).length,
					segmentsByBucket: bucketCounts,
					totalSegments: segments.length,
				},
			};
		}),

	retry: protectedProcedure
		.input(z.object({ jobId: z.string().cuid() }))
		.mutation(async ({ ctx, input }) => {
			const job = await ctx.db.classificationJob.findUnique({
				where: { id: input.jobId },
			});
			if (!job || job.userId !== ctx.session.user.id) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
			}
			if (job.status !== "FAILED" && job.status !== "CANCELLED") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Only failed or cancelled jobs can be retried",
				});
			}

			// Reset job state and increment retry count
			await ctx.db.classificationJob.update({
				data: {
					completedAt: null,
					errorMessage: null,
					retryCount: { increment: 1 },
					startedAt: null,
					status: "PENDING",
					triggerRunId: null,
				},
				where: { id: job.id },
			});

			// Reset non-completed segments back to PENDING
			await ctx.db.classificationSegment.updateMany({
				data: { errorMessage: null, status: "PENDING" },
				where: { jobId: job.id, status: { not: "COMPLETED" } },
			});

			// Re-trigger the pipeline
			try {
				const handle = await tasks.trigger("process-document", {
					jobId: job.id,
				});
				await ctx.db.classificationJob.update({
					data: { triggerRunId: handle.id },
					where: { id: job.id },
				});
			} catch {
				await ctx.db.classificationJob.update({
					data: {
						completedAt: new Date(),
						errorMessage: "Failed to start processing",
						status: "FAILED",
					},
					where: { id: job.id },
				});
			}

			return { jobId: job.id };
		}),

	retryFromStep: protectedProcedure
		.input(
			z.object({
				jobId: z.string().cuid(),
				fromStep: z.enum(["CLASSIFYING", "FINALIZING"]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const job = await ctx.db.classificationJob.findUnique({
				where: { id: input.jobId },
				include: { segments: { select: { id: true, status: true } } },
			});
			if (!job || job.userId !== ctx.session.user.id) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
			}
			if (job.status !== "FAILED" && job.status !== "CANCELLED") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Only failed or cancelled jobs can be retried",
				});
			}
			if (job.segments.length === 0) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message:
						"No segments found — use full retry instead (split must complete first)",
				});
			}

			// Reset job state
			await ctx.db.classificationJob.update({
				data: {
					completedAt: null,
					errorMessage: null,
					retryCount: { increment: 1 },
					status: "PENDING",
					triggerRunId: null,
				},
				where: { id: job.id },
			});

			if (input.fromStep === "CLASSIFYING") {
				// Reset all non-completed segments back to PENDING,
				// and clear classification results so they get re-classified
				await ctx.db.classificationSegment.updateMany({
					data: {
						errorMessage: null,
						status: "PENDING",
						subtype: null,
						confidence: null,
						confidenceLevel: null,
						reasoning: null,
						requiresReview: false,
						outputFileKey: null,
						suggestedFilename: null,
						encompassFolder: null,
					},
					where: {
						jobId: job.id,
						status: { not: "COMPLETED" },
					},
				});
			} else {
				// FINALIZING: clear output keys so finalize re-runs
				await ctx.db.classificationSegment.updateMany({
					data: {
						errorMessage: null,
						outputFileKey: null,
						suggestedFilename: null,
						status: "COMPLETED",
					},
					where: {
						jobId: job.id,
						status: { not: "COMPLETED" },
					},
				});
			}

			// Re-trigger the pipeline from the specified step
			try {
				const handle = await tasks.trigger("process-document", {
					jobId: job.id,
					fromStep: input.fromStep,
				});
				await ctx.db.classificationJob.update({
					data: { triggerRunId: handle.id },
					where: { id: job.id },
				});
			} catch {
				await ctx.db.classificationJob.update({
					data: {
						completedAt: new Date(),
						errorMessage: "Failed to start processing",
						status: "FAILED",
					},
					where: { id: job.id },
				});
			}

			return { jobId: job.id };
		}),

	cancel: protectedProcedure
		.input(z.object({ jobId: z.string().cuid() }))
		.mutation(async ({ ctx, input }) => {
			const job = await ctx.db.classificationJob.findUnique({
				where: { id: input.jobId },
			});
			if (!job || job.userId !== ctx.session.user.id) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
			}

			const inProgressStatuses = new Set([
				"PENDING",
				"INGESTING",
				"SPLITTING",
				"CLASSIFYING",
				"FINALIZING",
			]);
			if (!inProgressStatuses.has(job.status)) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Only in-progress jobs can be cancelled",
				});
			}

			// Cancel the Trigger.dev run if one exists
			if (job.triggerRunId) {
				try {
					await runs.cancel(job.triggerRunId);
				} catch {
					// Run may already be finished — safe to ignore
				}
			}

			await ctx.db.classificationJob.update({
				data: {
					completedAt: new Date(),
					status: "CANCELLED",
				},
				where: { id: job.id },
			});

			return { jobId: job.id };
		}),

	mergeSegments: protectedProcedure
		.input(
			z.object({
				jobId: z.string().cuid(),
				segmentIds: z.array(z.string().cuid()).min(2).max(50),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// 1. Validate job ownership
			const job = await ctx.db.classificationJob.findUnique({
				where: { id: input.jobId },
			});
			if (!job || job.userId !== ctx.session.user.id) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
			}

			// 2. Fetch all segments, verify they belong to job and are COMPLETED
			const segments = await ctx.db.classificationSegment.findMany({
				where: { id: { in: input.segmentIds }, jobId: input.jobId },
			});
			if (segments.length !== input.segmentIds.length) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "One or more segments not found in this job",
				});
			}
			const nonCompleted = segments.find((s) => s.status !== "COMPLETED");
			if (nonCompleted) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "All segments must be completed before merging",
				});
			}

			// 3. Sort by pageStart, validate adjacency
			const sorted = [...segments].sort((a, b) => a.pageStart - b.pageStart);
			for (let i = 1; i < sorted.length; i++) {
				const curr = sorted[i]!;
				const prev = sorted[i - 1]!;
				if (curr.pageStart !== prev.pageEnd + 1) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Selected segments must be adjacent (no page gaps)",
					});
				}
			}

			// 4. Compute merged range — sorted has at least 2 elements (input.segmentIds.min(2))
			const first = sorted[0]!;
			const last = sorted[sorted.length - 1]!;
			const mergedPageStart = first.pageStart;
			const mergedPageEnd = last.pageEnd;
			const deleteIds = sorted.slice(1).map((s) => s.id);

			// 5. Download source PDF from S3 and extract merged pages
			const res = await s3.send(
				new GetObjectCommand({
					Bucket: S3_BUCKET,
					Key: job.sourceFileKey,
				}),
			);
			if (!res.Body) throw new Error("Empty S3 response body");
			const fileBytes = await res.Body.transformToByteArray();
			const sourcePdf = await PDFDocument.load(fileBytes);

			const output = await PDFDocument.create();
			const indices = Array.from(
				{ length: mergedPageEnd - mergedPageStart + 1 },
				(_, i) => mergedPageStart - 1 + i,
			);
			const pages = await output.copyPages(sourcePdf, indices);
			for (const page of pages) {
				output.addPage(page);
			}
			const pdfBytes = await output.save();

			// 6. Build filename and upload to S3
			const idx = String(first.segmentIndex).padStart(3, "0");
			const label = first.subtype
				? first.subtype.toUpperCase()
				: "UNKNOWN";
			const filename = `${idx}_${label}.pdf`;
			const outputKey = `outputs/${job.loanId}/${job.id}/${filename}`;
			await uploadToS3(outputKey, new Uint8Array(pdfBytes), "application/pdf");

			// 7. Transaction: update keeper, delete absorbed, reindex
			await ctx.db.$transaction(async (tx) => {
				// Update the first segment with merged range + new output
				await tx.classificationSegment.update({
					where: { id: first.id },
					data: {
						pageEnd: mergedPageEnd,
						outputFileKey: outputKey,
						suggestedFilename: filename,
					},
				});

				// Delete absorbed segments
				await tx.classificationSegment.deleteMany({
					where: { id: { in: deleteIds } },
				});

				// Reindex: two-step to avoid unique constraint violations
				// (PG checks unique row-by-row during UPDATE, not at statement end)
				// Step 1: negate all indices to move them out of conflict range
				await tx.$executeRaw`
					UPDATE classification_segments
					SET "segmentIndex" = -"segmentIndex"
					WHERE "jobId" = ${input.jobId}
				`;
				// Step 2: assign correct sequential indices
				await tx.$executeRaw`
					UPDATE classification_segments
					SET "segmentIndex" = sub.new_index
					FROM (
						SELECT id, ROW_NUMBER() OVER (ORDER BY "pageStart" ASC)::int AS new_index
						FROM classification_segments
						WHERE "jobId" = ${input.jobId}
					) sub
					WHERE classification_segments.id = sub.id
				`;
			});

			return { mergedSegmentId: first.id };
		}),

	updateSegment: protectedProcedure
		.input(
			z.object({
				bucket: z.enum([
					"INCOME",
					"ASSETS",
					"TAX_RETURNS",
					"PROPERTY",
					"CREDIT",
					"IDENTITY",
					"DISCLOSURES",
					"BUSINESS",
					"APPRAISAL",
					"TITLE",
					"APPLICATION",
					"FRAUD",
					"UNKNOWN",
				]),
				jobId: z.string().cuid(),
				segmentId: z.string().cuid(),
				subtype: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Validate job ownership
			const job = await ctx.db.classificationJob.findUnique({
				where: { id: input.jobId },
			});
			if (!job || job.userId !== ctx.session.user.id) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
			}

			// Validate segment belongs to job
			const segment = await ctx.db.classificationSegment.findUnique({
				where: { id: input.segmentId },
			});
			if (!segment || segment.jobId !== input.jobId) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Segment not found",
				});
			}

			if (segment.status !== "COMPLETED") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Can only correct completed segments",
				});
			}

			// Validate subtype exists for the given bucket
			const bucketKey = input.bucket.toLowerCase();
			const rules = CLASSIFICATION_RULES[bucketKey];
			if (!rules?.some((r) => r.type === input.subtype)) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: `Invalid subtype "${input.subtype}" for bucket "${input.bucket}"`,
				});
			}

			// Preserve originals on first manual override
			const isFirstOverride = !segment.manuallyClassified;

			return ctx.db.classificationSegment.update({
				data: {
					bucket: input.bucket,
					classifiedAt: new Date(),
					classifiedBy: ctx.session.user.id,
					confidenceLevel: "HIGH",
					encompassFolder: ENCOMPASS_FOLDER_MAP[input.subtype] ?? null,
					manuallyClassified: true,
					...(isFirstOverride && {
						originalBucket: segment.bucket,
						originalSubtype: segment.subtype,
					}),
					requiresReview: false,
					subtype: input.subtype,
				},
				where: { id: input.segmentId },
			});
		}),
});
