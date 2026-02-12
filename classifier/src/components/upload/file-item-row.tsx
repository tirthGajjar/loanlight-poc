"use client";

import {
	Attachment01Icon,
	Cancel01Icon,
	RefreshIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { memo } from "react";

import type { JobStatus } from "@/components/jobs/job-phases";
import { PHASE_INDEX, PHASES } from "@/components/jobs/job-phases";
import { StatusBadge } from "@/components/jobs/status-badge";
import { Badge } from "@/components/ui/badge";
import type { UploadItem } from "./use-multi-upload";

interface FileItemRowProps {
	item: UploadItem;
	onRemove: (id: string) => void;
	onRetry: (id: string) => void;
}

export const FileItemRow = memo(function FileItemRow({
	item,
	onRemove,
	onRetry,
}: FileItemRowProps) {
	return (
		<div className="flex flex-col gap-2 rounded-xl border border-border px-4 py-3">
			<div className="flex items-center gap-3">
				<HugeiconsIcon
					className="size-4 shrink-0 text-muted-foreground"
					icon={Attachment01Icon}
					strokeWidth={1.5}
				/>
				<p className="min-w-0 flex-1 truncate text-sm">{item.file.name}</p>
				<ItemBadge item={item} />
				<ItemActions item={item} onRemove={onRemove} onRetry={onRetry} />
			</div>

			{/* Show inline stepper once we have a jobId */}
			{item.jobId &&
				(item.status === "processing" ||
					item.status === "completed" ||
					(item.status === "failed" && item.jobStatus)) && (
					<InlineStepper status={item.jobStatus ?? "PENDING"} />
				)}
		</div>
	);
});

function ItemBadge({ item }: { item: UploadItem }) {
	switch (item.status) {
		case "queued":
			return <Badge variant="outline">Queued</Badge>;
		case "uploading":
			return <Badge variant="secondary">{item.uploadProgress}%</Badge>;
		case "creating-job":
			return <Badge variant="secondary">Creating...</Badge>;
		case "processing":
			return item.jobStatus ? (
				<StatusBadge status={item.jobStatus} />
			) : (
				<Badge variant="secondary">Processing</Badge>
			);
		case "completed":
			return <Badge variant="default">Completed</Badge>;
		case "failed":
			return <Badge variant="destructive">Failed</Badge>;
	}
}

function ItemActions({
	item,
	onRemove,
	onRetry,
}: {
	item: UploadItem;
	onRemove: (id: string) => void;
	onRetry: (id: string) => void;
}) {
	if (item.status === "queued" || item.status === "uploading") {
		return (
			<button
				className="flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
				onClick={() => onRemove(item.id)}
				type="button"
			>
				<HugeiconsIcon
					className="size-3.5"
					icon={Cancel01Icon}
					strokeWidth={2}
				/>
			</button>
		);
	}

	if (item.status === "failed") {
		return (
			<div className="flex items-center gap-2">
				{/* Only show retry if it's a retriable failure (no job created yet) */}
				{!item.jobId && (
					<button
						className="flex shrink-0 items-center gap-1 text-muted-foreground text-xs transition-colors hover:text-foreground"
						onClick={() => onRetry(item.id)}
						type="button"
					>
						<HugeiconsIcon
							className="size-3.5"
							icon={RefreshIcon}
							strokeWidth={2}
						/>
						Retry
					</button>
				)}
				<button
					className="flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
					onClick={() => onRemove(item.id)}
					type="button"
				>
					<HugeiconsIcon
						className="size-3.5"
						icon={Cancel01Icon}
						strokeWidth={2}
					/>
				</button>
			</div>
		);
	}

	if (item.status === "completed" && item.jobId) {
		return (
			<Link
				className="text-primary text-xs hover:underline"
				href={`/jobs/${item.jobId}`}
			>
				View
			</Link>
		);
	}

	return null;
}

function InlineStepper({ status }: { status: JobStatus }) {
	if (status === "FAILED" || status === "CANCELLED") return null;

	const currentIndex = PHASE_INDEX[status] ?? 0;

	return (
		<div className="flex items-center gap-1.5 pl-7">
			{PHASES.map((phase, i) => {
				const completed = i < currentIndex;
				const active = i === currentIndex;
				const dotColor = completed
					? "bg-primary"
					: active
						? "bg-primary animate-pulse"
						: "bg-muted";
				const textColor =
					completed || active ? "text-foreground" : "text-muted-foreground";

				return (
					<div className="flex items-center gap-1.5" key={phase.key}>
						<div className="flex flex-col items-center gap-0.5">
							<div className={`size-1.5 rounded-full ${dotColor}`} />
							<span className={`text-[10px] leading-none ${textColor}`}>
								{phase.label}
							</span>
						</div>
						{i < PHASES.length - 1 && (
							<div
								className={`h-px w-3 ${completed ? "bg-primary" : "bg-muted"}`}
							/>
						)}
					</div>
				);
			})}
		</div>
	);
}
