import { z } from "zod";
import { adminProcedure, createTRPCRouter } from "../trpc";
import { requireDraftVersion } from "./categories-helpers";

const upsertCategoryInput = z.object({
	description: z.string().min(1),
	id: z.string().optional(),
	name: z.string().min(1),
	sortOrder: z.number().int(),
	versionId: z.string(),
});

const upsertSubtypeInput = z.object({
	categoryId: z.string(),
	description: z.string().min(1),
	encompassFolder: z.string().min(1),
	id: z.string().optional(),
	sortOrder: z.number().int(),
	type: z.string().min(1),
});

export const categoryMutationsRouter = createTRPCRouter({
	upsertCategory: adminProcedure
		.input(upsertCategoryInput)
		.mutation(async ({ ctx, input }) => {
			await requireDraftVersion(ctx.db, input.versionId);
			if (input.id) {
				return ctx.db.categoryDefinition.update({
					data: {
						description: input.description,
						name: input.name,
						sortOrder: input.sortOrder,
					},
					where: { id: input.id },
				});
			}
			return ctx.db.categoryDefinition.create({
				data: {
					description: input.description,
					name: input.name,
					sortOrder: input.sortOrder,
					versionId: input.versionId,
				},
			});
		}),

	deleteCategory: adminProcedure
		.input(z.object({ id: z.string(), versionId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await requireDraftVersion(ctx.db, input.versionId);
			await ctx.db.categoryDefinition.delete({
				where: { id: input.id },
			});
		}),

	upsertSubtype: adminProcedure
		.input(upsertSubtypeInput)
		.mutation(async ({ ctx, input }) => {
			const cat = await ctx.db.categoryDefinition.findUniqueOrThrow({
				where: { id: input.categoryId },
			});
			await requireDraftVersion(ctx.db, cat.versionId);
			if (input.id) {
				return ctx.db.subtypeDefinition.update({
					data: {
						description: input.description,
						encompassFolder: input.encompassFolder,
						sortOrder: input.sortOrder,
						type: input.type,
					},
					where: { id: input.id },
				});
			}
			return ctx.db.subtypeDefinition.create({
				data: {
					categoryId: input.categoryId,
					description: input.description,
					encompassFolder: input.encompassFolder,
					sortOrder: input.sortOrder,
					type: input.type,
				},
			});
		}),

	swapCategorySortOrder: adminProcedure
		.input(
			z.object({
				idA: z.string(),
				idB: z.string(),
				versionId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await requireDraftVersion(ctx.db, input.versionId);
			const [a, b] = await Promise.all([
				ctx.db.categoryDefinition.findUniqueOrThrow({
					where: { id: input.idA },
				}),
				ctx.db.categoryDefinition.findUniqueOrThrow({
					where: { id: input.idB },
				}),
			]);
			await Promise.all([
				ctx.db.categoryDefinition.update({
					data: { sortOrder: b.sortOrder },
					where: { id: input.idA },
				}),
				ctx.db.categoryDefinition.update({
					data: { sortOrder: a.sortOrder },
					where: { id: input.idB },
				}),
			]);
		}),

	deleteSubtype: adminProcedure
		.input(z.object({ categoryId: z.string(), id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const cat = await ctx.db.categoryDefinition.findUniqueOrThrow({
				where: { id: input.categoryId },
			});
			await requireDraftVersion(ctx.db, cat.versionId);
			await ctx.db.subtypeDefinition.delete({
				where: { id: input.id },
			});
		}),
});
