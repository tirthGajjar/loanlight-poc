import { Badge } from "@/components/ui/badge";

type Variant = "default" | "destructive" | "outline" | "secondary";

const STATUS_CONFIG: Record<string, { label: string; variant: Variant }> = {
	CANCELLED: { label: "Cancelled", variant: "outline" },
	CLASSIFYING: { label: "Classifying", variant: "secondary" },
	COMPLETED: { label: "Completed", variant: "default" },
	FAILED: { label: "Failed", variant: "destructive" },
	FINALIZING: { label: "Finalizing", variant: "secondary" },
	INGESTING: { label: "Uploading", variant: "secondary" },
	PENDING: { label: "Queued", variant: "outline" },
	SPLITTING: { label: "Splitting", variant: "secondary" },
};

export function StatusBadge({ status }: { status: string }) {
	const config = STATUS_CONFIG[status] ?? {
		label: status,
		variant: "outline" as const,
	};
	return <Badge variant={config.variant}>{config.label}</Badge>;
}
