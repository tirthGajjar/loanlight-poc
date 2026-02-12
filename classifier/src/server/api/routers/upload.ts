import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { S3_BUCKET, s3 } from "@/server/s3";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const PRESIGN_EXPIRY = 900; // 15 minutes

const presignInput = z.object({
	contentType: z
		.string()
		.refine((ct) => ct === "application/pdf", "Only PDF files are allowed"),
	fileSizeBytes: z
		.number()
		.positive()
		.max(MAX_FILE_SIZE, "File size exceeds 500MB limit"),
	filename: z.string().min(1, "Filename is required"),
	loanId: z.string().cuid(),
});

export const uploadRouter = createTRPCRouter({
	presign: protectedProcedure
		.input(presignInput)
		.mutation(async ({ ctx, input }) => {
			const loan = await ctx.db.loan.findUnique({
				where: { id: input.loanId },
			});

			if (!loan || loan.userId !== ctx.session.user.id) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Loan not found",
				});
			}

			const timestamp = Date.now();
			const s3Key = `uploads/${input.loanId}/${timestamp}_${input.filename}`;

			try {
				const command = new PutObjectCommand({
					Bucket: S3_BUCKET,
					ContentType: input.contentType,
					Key: s3Key,
				});

				const presignedUrl = await getSignedUrl(s3, command, {
					expiresIn: PRESIGN_EXPIRY,
				});

				return { expiresIn: PRESIGN_EXPIRY, presignedUrl, s3Key };
			} catch {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to generate upload URL. Please try again.",
				});
			}
		}),
});
