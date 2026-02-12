export const PHASES = [
	{ key: "PENDING", label: "Queued" },
	{ key: "INGESTING", label: "Uploading" },
	{ key: "SPLITTING", label: "Splitting" },
	{ key: "CLASSIFYING", label: "Classifying" },
	{ key: "FINALIZING", label: "Finalizing" },
	{ key: "COMPLETED", label: "Completed" },
] as const;

export type JobStatus = (typeof PHASES)[number]["key"] | "FAILED" | "CANCELLED";

export const PHASE_INDEX: Record<string, number> = Object.fromEntries(
	PHASES.map((p, i) => [p.key, i]),
);

export const TERMINAL_STATUSES = new Set<JobStatus>([
	"COMPLETED",
	"FAILED",
	"CANCELLED",
]);
