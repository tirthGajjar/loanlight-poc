"use client";

import { Fragment } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { PHASE_INDEX, PHASES } from "./job-phases";

interface JobProgressProps {
	classifyingProgress?: { completed: number; total: number };
	status: string;
}

export function JobProgress({ classifyingProgress, status }: JobProgressProps) {
	if (status === "FAILED" || status === "CANCELLED") return null;

	const currentIndex = PHASE_INDEX[status] ?? 0;

	return (
		<Card>
			<CardContent className="py-4">
				<div>
					<div className="flex items-center gap-2">
						{PHASES.map((phase, i) => {
							const completed = i < currentIndex;
							const active = i === currentIndex;
							const dotColor = completed
								? "bg-primary"
								: active
									? "bg-primary animate-pulse"
									: "bg-muted";
							return (
								<Fragment key={phase.key}>
									<div
										className={`size-2.5 shrink-0 rounded-full ${dotColor}`}
									/>
									{i < PHASES.length - 1 && (
										<div
											className={`h-px flex-1 ${completed ? "bg-primary" : "bg-muted"}`}
										/>
									)}
								</Fragment>
							);
						})}
					</div>
					<div className="mt-1.5 flex justify-between">
						{PHASES.map((phase, i) => {
							const completed = i < currentIndex;
							const active = i === currentIndex;
							const textColor =
								completed || active
									? "text-foreground"
									: "text-muted-foreground";
							return (
								<span
									className={`text-xs ${textColor} ${i === 0 ? "text-left" : i === PHASES.length - 1 ? "text-right" : "text-center"}`}
									key={phase.key}
								>
									{phase.label}
								</span>
							);
						})}
					</div>
				</div>
				{status === "SPLITTING" && (
					<p className="mt-3 text-muted-foreground text-sm">
						Analyzing document structure...
					</p>
				)}
				{status === "CLASSIFYING" &&
					classifyingProgress &&
					classifyingProgress.total > 0 && (
						<div className="mt-3 space-y-1.5">
							<p className="text-muted-foreground text-sm">
								Classifying segments... {classifyingProgress.completed}/
								{classifyingProgress.total}
							</p>
							<div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
								<div
									className="h-full rounded-full bg-primary transition-all duration-300"
									style={{
										width: `${(classifyingProgress.completed / classifyingProgress.total) * 100}%`,
									}}
								/>
							</div>
						</div>
					)}
			</CardContent>
		</Card>
	);
}
