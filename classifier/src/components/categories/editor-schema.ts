import { z } from "zod";

const subtypeSchema = z.object({
	description: z.string().min(1, "Required"),
	encompassFolder: z.string().min(1, "Required"),
	id: z.string().optional(),
	sortOrder: z.coerce.number().int().min(0),
	type: z.string().min(1, "Required"),
});

export const editorSchema = z.object({
	description: z.string().min(1, "Required"),
	name: z.string().min(1, "Required"),
	sortOrder: z.coerce.number().int().min(0),
	subtypes: z.array(subtypeSchema),
});
