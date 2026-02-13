import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { runs, tasks } from "@trigger.dev/sdk";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { ENCOMPASS_FOLDER_MAP } from "@/lib/classification/encompass-map";
import { CLASSIFICATION_RULES } from "@/lib/classification/rules";
import { S3_BUCKET, s3 } from "@/server/s3";
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
