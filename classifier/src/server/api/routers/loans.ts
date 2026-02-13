import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const loansRouter = createTRPCRouter({
	list: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.loan.findMany({
			where: { userId: ctx.session.user.id },
			// biome-ignore lint/style/useNamingConvention: Prisma API
			include: { _count: { select: { classificationJobs: true } } },
			orderBy: { createdAt: "desc" },
		});
	}),

	get: protectedProcedure
		.input(z.object({ id: z.string().cuid() }))
		.query(async ({ ctx, input }) => {
			const loan = await ctx.db.loan.findUnique({
				where: { id: input.id },
				include: {
					classificationJobs: {
						orderBy: { createdAt: "desc" },
						// biome-ignore lint/style/useNamingConvention: Prisma API
						include: { _count: { select: { segments: true } } },
					},
				},
			});

			if (!loan || loan.userId !== ctx.session.user.id) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Loan not found",
				});
			}

			return loan;
		}),

	getDocuments: protectedProcedure
		.input(z.object({ loanId: z.string().cuid() }))
		.query(async ({ ctx, input }) => {
			const loan = await ctx.db.loan.findUnique({
				where: { id: input.loanId },
			});
			if (!loan || loan.userId !== ctx.session.user.id) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Loan not found",
				});
			}

			const segments = await ctx.db.classificationSegment.findMany({
				where: {
					job: { loanId: input.loanId },
					status: "COMPLETED",
				},
				include: {
					job: { select: { id: true, sourceFileName: true } },
				},
				orderBy: [{ encompassFolder: "asc" }, { suggestedFilename: "asc" }],
			});

			return { loan, segments };
		}),

	create: protectedProcedure
		.input(
			z.object({
				borrowerName: z.string().optional(),
				loanNumber: z.string().min(1),
				propertyAddress: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.loan.create({
				data: {
					borrowerName: input.borrowerName || null,
					loanNumber: input.loanNumber,
					propertyAddress: input.propertyAddress || null,
					userId: ctx.session.user.id,
				},
			});
		}),
});
