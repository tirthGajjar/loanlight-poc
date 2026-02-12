/** Map DefinitionVersionStatus to Badge variant */
export function statusVariant(status: string) {
	if (status === "PUBLISHED") return "default" as const;
	if (status === "DRAFT") return "outline" as const;
	return "secondary" as const;
}
