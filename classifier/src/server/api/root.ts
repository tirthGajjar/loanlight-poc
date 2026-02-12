import {
	createCallerFactory,
	createTRPCRouter,
	publicProcedure,
} from "@/server/api/trpc";
import { categoriesRouter } from "./routers/categories";
import { categoryMutationsRouter } from "./routers/categories-mutations";
import { jobsRouter } from "./routers/jobs";
import { loansRouter } from "./routers/loans";
import { pdfRouter } from "./routers/pdf";
import { uploadRouter } from "./routers/upload";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	// Health check endpoint
	health: publicProcedure.query(() => {
		return { status: "ok", timestamp: new Date().toISOString() };
	}),

	categories: categoriesRouter,
	categoryMutations: categoryMutationsRouter,
	jobs: jobsRouter,
	loans: loansRouter,
	pdf: pdfRouter,
	upload: uploadRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.jobs.list();
 */
export const createCaller = createCallerFactory(appRouter);
