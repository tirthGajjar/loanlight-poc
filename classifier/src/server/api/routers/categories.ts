import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, createTRPCRouter, protectedProcedure } from "../trpc";

const versionInclude = {
	categories: {
		include: { subtypes: { orderBy: { sortOrder: "asc" as const } } },
		orderBy: { sortOrder: "asc" as const },
	},
	createdBy: { select: { name: true } },
	publishedBy: { select: { name: true } },
};

export const categoriesRouter = createTRPCRouter({
	/**
	 * Returns the "working" version: draft if one exists, otherwise published.
	 * This is the single query the main categories page uses.
	 */
	getWorkingVersion: protectedProcedure.query(async ({ ctx }) => {
		const draft = await ctx.db.categoryDefinitionVersion.findFirst({
			include: versionInclude,
			where: { status: "DRAFT" },
		});
		if (draft) return { ...draft, hasDraft: true };

		const published = await ctx.db.categoryDefinitionVersion.findFirst({
			include: versionInclude,
			where: { status: "PUBLISHED" },
		});
		if (published) return { ...published, hasDraft: false };

		return null;
	}),

	/**
	 * Ensure a DRAFT version exists. If not, creates one by copying from published.
	 * Returns the draft version.
	 */
	ensureDraft: adminProcedure.mutation(async ({ ctx }) => {
		const existing = await ctx.db.categoryDefinitionVersion.findFirst({
			where: { status: "DRAFT" },
		});
		if (existing) return existing;

		const latest = await ctx.db.categoryDefinitionVersion.findFirst({
			include: { categories: { include: { subtypes: true } } },
			orderBy: { version: "desc" },
			where: { status: "PUBLISHED" },
		});

		const draft = await ctx.db.categoryDefinitionVersion.create({
			data: { createdById: ctx.session.user.id },
		});

		if (latest) {
			for (const cat of latest.categories) {
				await ctx.db.categoryDefinition.create({
					data: {
						description: cat.description,
						name: cat.name,
						sortOrder: cat.sortOrder,
						subtypes: {
							create: cat.subtypes.map((s) => ({
								description: s.description,
								encompassFolder: s.encompassFolder,
								sortOrder: s.sortOrder,
								type: s.type,
							})),
						},
						versionId: draft.id,
					},
				});
			}
		}

		return draft;
	}),

	/** Delete the current draft, reverting to published state. */
	discardDraft: adminProcedure.mutation(async ({ ctx }) => {
		const draft = await ctx.db.categoryDefinitionVersion.findFirst({
			where: { status: "DRAFT" },
		});
		if (!draft) throw new TRPCError({ code: "NOT_FOUND" });
		await ctx.db.categoryDefinitionVersion.delete({
			where: { id: draft.id },
		});
	}),

	/** Publish whatever DRAFT exists. No versionId input needed. */
	publishVersion: adminProcedure.mutation(async ({ ctx }) => {
		const draft = await ctx.db.categoryDefinitionVersion.findFirst({
			where: { status: "DRAFT" },
		});
		if (!draft) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "No draft version to publish",
			});
		}
		await ctx.db.$transaction([
			ctx.db.categoryDefinitionVersion.updateMany({
				data: { status: "ARCHIVED" },
				where: { status: "PUBLISHED" },
			}),
			ctx.db.categoryDefinitionVersion.update({
				data: {
					publishedAt: new Date(),
					publishedById: ctx.session.user.id,
					status: "PUBLISHED",
				},
				where: { id: draft.id },
			}),
		]);
	}),

	listVersions: protectedProcedure.query(({ ctx }) =>
		ctx.db.categoryDefinitionVersion.findMany({
			include: {
				// biome-ignore lint/style/useNamingConvention: Prisma API
				_count: { select: { categories: true } },
				createdBy: { select: { name: true } },
				publishedBy: { select: { name: true } },
			},
			orderBy: { version: "desc" },
		}),
	),

	getVersion: protectedProcedure
		.input(z.object({ versionId: z.string() }))
		.query(({ ctx, input }) =>
			ctx.db.categoryDefinitionVersion.findUniqueOrThrow({
				include: versionInclude,
				where: { id: input.versionId },
			}),
		),

	getPublished: protectedProcedure.query(({ ctx }) =>
		ctx.db.categoryDefinitionVersion.findFirst({
			include: {
				categories: {
					include: { subtypes: { orderBy: { sortOrder: "asc" } } },
					orderBy: { sortOrder: "asc" },
				},
			},
			where: { status: "PUBLISHED" },
		}),
	),

	deleteVersion: adminProcedure
		.input(z.object({ versionId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const v = await ctx.db.categoryDefinitionVersion.findUnique({
				where: { id: input.versionId },
			});
			if (!v) throw new TRPCError({ code: "NOT_FOUND" });
			if (v.status !== "DRAFT") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Only DRAFT versions can be deleted",
				});
			}
			await ctx.db.categoryDefinitionVersion.delete({
				where: { id: input.versionId },
			});
		}),
});
