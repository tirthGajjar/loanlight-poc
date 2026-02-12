"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PHASES, PHASE_INDEX } from "./job-phases";

export function JobProgress({ status }: { status: string }) {
	if (status === "FAILED" || status === "CANCELLED") return null;

	const currentIndex = PHASE_INDEX[status] ?? 0;

	return (
		<Card>
			<CardContent className="py-4">
				<div className="flex items-center gap-2">
					{PHASES.map((phase, i) => (
						<PhaseStep
							active={i === currentIndex}
							completed={i < currentIndex}
							key={phase.key}
							label={phase.label}
							last={i === PHASES.length - 1}
						/>
					))}
				</div>
				{status === "SPLITTING" && (
					<p className="mt-3 text-muted-foreground text-sm">
						Analyzing document structure...
					</p>
				)}
			</CardContent>
		</Card>
	);
}

function PhaseStep({
	active,
	completed,
	label,
	last,
}: {
	active: boolean;
	completed: boolean;
	label: string;
	last: boolean;
}) {
	const dotColor = completed
		? "bg-primary"
		: active
			? "bg-primary animate-pulse"
			: "bg-muted";
	const textColor =
		completed || active ? "text-foreground" : "text-muted-foreground";

	return (
		<>
			<div className="flex flex-col items-center gap-1">
				<div className={`size-2.5 rounded-full ${dotColor}`} />
				<span className={`text-xs ${textColor}`}>{label}</span>
			</div>
			{!last && (
				<div
					className={`h-px flex-1 ${completed ? "bg-primary" : "bg-muted"}`}
				/>
			)}
		</>
	);
}
