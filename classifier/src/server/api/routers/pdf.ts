import { Writable } from "node:stream";
import { TRPCError } from "@trpc/server";
import archiver from "archiver";
import { z } from "zod";

import { getObject, getPresignedGetUrl, uploadToS3 } from "@/server/s3";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const PDF_EXT_RE = /\.pdf$/i;

function formatBucketAsFolder(
	encompassFolder: string | null,
	bucket: string | null,
): string {
	if (encompassFolder) return encompassFolder;
	if (!bucket) return "Unknown";
	return bucket
		.split("_")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
		.join(" ");
}

async function createZipBuffer(
	files: { data: Uint8Array; path: string }[],
	manifest: string,
): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		const chunks: Buffer[] = [];
		const writable = new Writable({
			write(chunk, _encoding, cb) {
				chunks.push(Buffer.from(chunk));
				cb();
			},
		});

		const archive = archiver("zip", { zlib: { level: 5 } });
		archive.on("error", reject);
		writable.on("finish", () => resolve(Buffer.concat(chunks)));

		archive.pipe(writable);
		archive.append(manifest, { name: "manifest.csv" });
		for (const f of files) {
			archive.append(Buffer.from(f.data), { name: f.path });
		}
		archive.finalize();
	});
}

export const pdfRouter = createTRPCRouter({
	getSourceUrl: protectedProcedure
		.input(z.object({ jobId: z.string().cuid() }))
		.query(async ({ ctx, input }) => {
			const job = await ctx.db.classificationJob.findUnique({
				where: { id: input.jobId },
			});

			if (!job || job.userId !== ctx.session.user.id) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
			}

			const url = await getPresignedGetUrl(job.sourceFileKey);
			return { totalPages: job.totalPages, url };
		}),

	getSegmentUrl: protectedProcedure
		.input(
			z.object({
				jobId: z.string().cuid(),
				segmentId: z.string().cuid(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const job = await ctx.db.classificationJob.findUnique({
				where: { id: input.jobId },
			});

			if (!job || job.userId !== ctx.session.user.id) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
			}

			const segment = await ctx.db.classificationSegment.findUnique({
				where: { id: input.segmentId },
			});

			if (!segment || segment.jobId !== input.jobId) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Segment not found",
				});
			}

			if (!segment.outputFileKey) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Segment PDF not yet available",
				});
			}

			const url = await getPresignedGetUrl(segment.outputFileKey);
			return {
				pageEnd: segment.pageEnd,
				pageStart: segment.pageStart,
				suggestedFilename: segment.suggestedFilename,
				url,
			};
		}),

	downloadAll: protectedProcedure
		.input(z.object({ jobId: z.string().cuid() }))
		.mutation(async ({ ctx, input }) => {
			const job = await ctx.db.classificationJob.findUnique({
				include: {
					segments: {
						orderBy: { segmentIndex: "asc" },
						where: { outputFileKey: { not: null }, status: "COMPLETED" },
					},
				},
				where: { id: input.jobId },
			});

			if (!job || job.userId !== ctx.session.user.id) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
			}

			if (job.status !== "COMPLETED") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Job is not completed",
				});
			}

			if (job.segments.length === 0) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "No downloadable segments",
				});
			}

			// Download all segment PDFs concurrently
			const downloads = await Promise.all(
				job.segments.map(async (seg) => ({
					data: await getObject(seg.outputFileKey as string),
					segment: seg,
				})),
			);

			// Build CSV manifest
			const csvHeader =
				"Index,Bucket,Subtype,Confidence,Encompass Folder,Filename,Pages";
			const csvRows = downloads.map(({ segment: seg }) => {
				const folder = formatBucketAsFolder(seg.encompassFolder, seg.bucket);
				const filename =
					seg.suggestedFilename ??
					`${String(seg.segmentIndex).padStart(3, "0")}_UNKNOWN.pdf`;
				const pages =
					seg.pageStart === seg.pageEnd
						? String(seg.pageStart)
						: `${seg.pageStart}-${seg.pageEnd}`;
				return [
					seg.segmentIndex,
					seg.bucket ?? "UNKNOWN",
					seg.subtype ?? "UNKNOWN",
					seg.confidence != null ? seg.confidence.toFixed(2) : "",
					folder,
					filename,
					pages,
				].join(",");
			});
			const manifest = [csvHeader, ...csvRows].join("\n");

			// Build ZIP file entries
			const files = downloads.map(({ data, segment: seg }) => {
				const folder = formatBucketAsFolder(seg.encompassFolder, seg.bucket);
				const filename =
					seg.suggestedFilename ??
					`${String(seg.segmentIndex).padStart(3, "0")}_UNKNOWN.pdf`;
				return { data, path: `${folder}/${filename}` };
			});

			const zipBuffer = await createZipBuffer(files, manifest);

			// Upload ZIP to S3
			const baseName = job.sourceFileName.replace(PDF_EXT_RE, "");
			const zipKey = `exports/${job.loanId}/${job.id}/${baseName}_classified.zip`;
			await uploadToS3(zipKey, new Uint8Array(zipBuffer), "application/zip");

			const url = await getPresignedGetUrl(zipKey);
			return { filename: `${baseName}_classified.zip`, url };
		}),
});
