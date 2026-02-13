"use client";

import {
	ArrowDown01Icon,
	Cancel01Icon,
	Download04Icon,
	FileViewIcon,
	RefreshIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";

const SourcePdfPanel = dynamic(
	() =>
		import("@/components/pdf/source-pdf-panel").then((m) => m.SourcePdfPanel),
	{ ssr: false },
);

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { TERMINAL_STATUSES } from "./job-phases";
import { JobProgress } from "./job-progress";
import { JobSummary } from "./job-summary";
import { SegmentList } from "./segment-list";
import { StatusBadge } from "./status-badge";

const POLL_MS = 3000;

export function JobDetail({ jobId }: { jobId: string }) {
	const [showSource, setShowSource] = useState(false);
	const [sourcePage, setSourcePage] = useState(1);
	const [sourcePageRange, setSourcePageRange] = useState<{
		start: number;
		end: number;
	} | null>(null);
	const [selectedBuckets, setSelectedBuckets] = useState<Set<string>>(
		new Set(),
	);

	const handleToggleBucket = useCallback((bucket: string) => {
		setSelectedBuckets((prev) => {
			const next = new Set(prev);
			if (next.has(bucket)) {
				next.delete(bucket);
			} else {
				next.add(bucket);
			}
			return next;
		});
	}, []);

	const utils = api.useUtils();
	const { data, error, refetch } = api.jobs.getStatus.useQuery(
		{ jobId },
		{
			refetchInterval: (query) => {
				const s = query.state.data?.status;
				return s && TERMINAL_STATUSES.has(s) ? false : POLL_MS;
			},
		},
	);

	const retryMutation = api.jobs.retry.useMutation({
		onSuccess: () => utils.jobs.getStatus.invalidate({ jobId }),
	});
	const retryFromStepMutation = api.jobs.retryFromStep.useMutation({
		onSuccess: () => utils.jobs.getStatus.invalidate({ jobId }),
	});
	const cancelMutation = api.jobs.cancel.useMutation({
		onSuccess: () => utils.jobs.getStatus.invalidate({ jobId }),
	});

	const handleLocateInSource = useCallback(
		(pageStart: number, pageEnd?: number) => {
			setSourcePage(pageStart);
			setSourcePageRange(
				pageEnd != null ? { start: pageStart, end: pageEnd } : null,
			);
			setShowSource(true);
		},
		[],
	);

	const classifyingProgress = useMemo(() => {
		if (!data || data.status !== "CLASSIFYING" || data.segments.length === 0)
			return undefined;
		const completed = data.segments.filter(
			(s) => s.status === "COMPLETED" || s.status === "FAILED",
		).length;
		return { completed, total: data.segments.length };
	}, [data]);

	if (error) {
		return (
			<Card>
				<CardContent className="space-y-3 py-8 text-center">
					<p className="text-destructive text-sm">{error.message}</p>
					<Button onClick={() => refetch()} variant="outline">
						Retry
					</Button>
				</CardContent>
			</Card>
		);
	}

	if (!data) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-4 w-48" />
				<Skeleton className="h-24 w-full" />
			</div>
		);
	}

	const mainContent = (
		<div className="space-y-6">
			<JobHeader
				allSegmentsClassified={
					data.segments.length > 0 &&
					data.segments.every((s) => s.subtype != null)
				}
				cancelPending={cancelMutation.isPending}
				completedAt={data.completedAt}
				createdAt={data.createdAt}
				fileName={data.sourceFileName}
				hasSegments={data.segments.length > 0}
				jobId={jobId}
				onCancel={() => cancelMutation.mutate({ jobId })}
				onRetry={() => retryMutation.mutate({ jobId })}
				onRetryFromStep={(fromStep) =>
					retryFromStepMutation.mutate({ jobId, fromStep })
				}
				onTogglePreview={() => setShowSource((v) => !v)}
				retryPending={
					retryMutation.isPending || retryFromStepMutation.isPending
				}
				showPreviewButton={TERMINAL_STATUSES.has(data.status)}
				showSource={showSource}
				startedAt={data.startedAt}
				status={data.status}
				totalPages={data.totalPages}
			/>
			<JobProgress
				classifyingProgress={classifyingProgress}
				status={data.status}
			/>
			{data.summary.totalSegments > 0 && (
				<JobSummary
					onToggleBucket={handleToggleBucket}
					selectedBuckets={selectedBuckets}
					summary={data.summary}
				/>
			)}
			{data.segments.length > 0 && (
				<SegmentList
					bucketFilter={selectedBuckets}
					jobId={jobId}
					onLocateInSource={handleLocateInSource}
					onSegmentClick={(seg) =>
						handleLocateInSource(seg.pageStart, seg.pageEnd)
					}
					segments={data.segments}
				/>
			)}
			{data.status === "FAILED" && data.errorMessage && (
				<Card>
					<CardContent className="space-y-3 py-4">
						<p className="text-destructive text-sm">{data.errorMessage}</p>
						<Button onClick={() => refetch()} size="sm" variant="outline">
							Refresh
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);

	return (
		<div
			className={cn(
				showSource
					? "grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]"
					: "space-y-6",
			)}
		>
			{showSource ? (
				<>
					<div className="min-w-0">{mainContent}</div>
					<div className="sticky top-4 h-[calc(100vh-6rem)] min-w-0">
						<SourcePdfPanel
							initialPage={sourcePage}
							jobId={jobId}
							onClose={() => setShowSource(false)}
							onPageChange={setSourcePage}
							pageRange={sourcePageRange}
						/>
					</div>
				</>
			) : (
				mainContent
			)}
		</div>
	);
}

const IN_PROGRESS_STATUSES = new Set([
	"PENDING",
	"INGESTING",
	"SPLITTING",
	"CLASSIFYING",
	"FINALIZING",
]);

function JobHeader({
	allSegmentsClassified,
	cancelPending,
	completedAt,
	createdAt,
	fileName,
	hasSegments,
	jobId,
	onCancel,
	onRetry,
	onRetryFromStep,
	onTogglePreview,
	retryPending,
	showPreviewButton,
	showSource,
	startedAt,
	status,
	totalPages,
}: {
	allSegmentsClassified: boolean;
	cancelPending: boolean;
	completedAt: Date | null;
	createdAt: Date;
	fileName: string;
	hasSegments: boolean;
	jobId: string;
	onCancel: () => void;
	onRetry: () => void;
	onRetryFromStep: (fromStep: "CLASSIFYING" | "FINALIZING") => void;
	onTogglePreview: () => void;
	retryPending: boolean;
	showPreviewButton: boolean;
	showSource: boolean;
	startedAt: Date | null;
	status: string;
	totalPages: number | null;
}) {
	const elapsed =
		startedAt && completedAt
			? `${((completedAt.getTime() - startedAt.getTime()) / 1000).toFixed(1)}s`
			: null;

	return (
		<div className="flex items-start justify-between">
			<div className="space-y-1">
				<h1 className="font-semibold text-2xl tracking-tight">{fileName}</h1>
				<div className="flex gap-3 text-muted-foreground text-sm">
					{totalPages != null && <span>{totalPages} pages</span>}
					{elapsed && <span>{elapsed}</span>}
					<span>{createdAt.toLocaleDateString()}</span>
				</div>
			</div>
			<div className="flex items-center gap-2">
				{(status === "FAILED" || status === "CANCELLED") && !hasSegments && (
					<Button
						disabled={retryPending}
						onClick={onRetry}
						size="sm"
						variant="outline"
					>
						<HugeiconsIcon
							data-icon="inline-start"
							icon={RefreshIcon}
							strokeWidth={2}
						/>
						{retryPending ? "Retrying..." : "Retry"}
					</Button>
				)}
				{(status === "FAILED" || status === "CANCELLED") && hasSegments && (
					<DropdownMenu>
						<DropdownMenuTrigger
							className="inline-flex h-8 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-3 font-medium text-sm shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0"
							disabled={retryPending}
						>
							<HugeiconsIcon icon={RefreshIcon} strokeWidth={2} />
							{retryPending ? "Retrying..." : "Retry"}
							<HugeiconsIcon
								className="size-3.5 opacity-60"
								icon={ArrowDown01Icon}
								strokeWidth={2}
							/>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={onRetry}>
								<HugeiconsIcon icon={RefreshIcon} strokeWidth={2} />
								Retry All
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={() => onRetryFromStep("CLASSIFYING")}>
								Retry from Classify
							</DropdownMenuItem>
							{allSegmentsClassified && (
								<DropdownMenuItem onClick={() => onRetryFromStep("FINALIZING")}>
									Retry from Finalize
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				)}
				{IN_PROGRESS_STATUSES.has(status) && (
					<Button
						disabled={cancelPending}
						onClick={onCancel}
						size="sm"
						variant="outline"
					>
						<HugeiconsIcon
							data-icon="inline-start"
							icon={Cancel01Icon}
							strokeWidth={2}
						/>
						{cancelPending ? "Cancelling..." : "Cancel"}
					</Button>
				)}
				{status === "COMPLETED" && <DownloadAllButton jobId={jobId} />}
				{showPreviewButton && (
					<Button onClick={onTogglePreview} size="sm" variant="outline">
						<HugeiconsIcon
							data-icon="inline-start"
							icon={FileViewIcon}
							strokeWidth={2}
						/>
						{showSource ? "Hide PDF" : "Preview PDF"}
					</Button>
				)}
				<StatusBadge status={status} />
			</div>
		</div>
	);
}

function DownloadAllButton({ jobId }: { jobId: string }) {
	const [error, setError] = useState(false);
	const downloadAll = api.pdf.downloadAll.useMutation();

	const handleClick = useCallback(async () => {
		setError(false);
		try {
			const { url, filename } = await downloadAll.mutateAsync({ jobId });

			const res = await fetch(url);
			if (!res.ok) throw new Error(`Download failed: ${res.status}`);

			const blob = await res.blob();
			const blobUrl = URL.createObjectURL(blob);

			const a = document.createElement("a");
			a.href = blobUrl;
			a.download = filename;
			a.click();

			URL.revokeObjectURL(blobUrl);
		} catch {
			setError(true);
		}
	}, [jobId]);

	return (
		<Button
			disabled={downloadAll.isPending}
			onClick={handleClick}
			size="sm"
			title={
				error
					? "Download failed — click to retry"
					: "Download all segments as ZIP"
			}
			variant={error ? "destructive" : "outline"}
		>
			{downloadAll.isPending ? (
				<>
					<div className="size-3.5 animate-spin rounded-full border-2 border-muted border-t-primary" />
					Preparing ZIP...
				</>
			) : (
				<>
					<HugeiconsIcon
						data-icon="inline-start"
						icon={Download04Icon}
						strokeWidth={2}
					/>
					Download All
				</>
			)}
		</Button>
	);
}
