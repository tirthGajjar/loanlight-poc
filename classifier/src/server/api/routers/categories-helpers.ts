import { TRPCError } from "@trpc/server";
import type { db } from "@/server/db";

type Db = typeof db;

/** Ensure the target version exists and is a DRAFT */
export async function requireDraftVersion(prisma: Db, versionId: string) {
	const v = await prisma.categoryDefinitionVersion.findUnique({
		where: { id: versionId },
	});
	if (!v) throw new TRPCError({ code: "NOT_FOUND" });
	if (v.status !== "DRAFT") {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Only DRAFT versions can be edited",
		});
	}
	return v;
}
