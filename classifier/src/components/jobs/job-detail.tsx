"use client";

import {
	Cancel01Icon,
	Download04Icon,
	FileViewIcon,
	RefreshIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useState } from "react";

import { SegmentPreviewDialog } from "@/components/pdf/segment-preview-dialog";
import { SourcePdfPanel } from "@/components/pdf/source-pdf-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { TERMINAL_STATUSES } from "./job-phases";
import { JobProgress } from "./job-progress";
import { JobSummary } from "./job-summary";
import { SegmentList } from "./segment-list";
import { StatusBadge } from "./status-badge";

const POLL_MS = 3000;

interface SegmentInfo {
	bucket: string | null;
	confidence: number | null;
	confidenceLevel: string | null;
	encompassFolder: string | null;
	id: string;
	manuallyClassified: boolean;
	pageEnd: number;
	pageStart: number;
	reasoning: string | null;
	segmentIndex: number;
	status: string;
	subtype: string | null;
}

export function JobDetail({ jobId }: { jobId: string }) {
	const [showSource, setShowSource] = useState(false);
	const [sourcePage, setSourcePage] = useState(1);
	const [selectedSegment, setSelectedSegment] = useState<SegmentInfo | null>(
		null,
	);

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
	const cancelMutation = api.jobs.cancel.useMutation({
		onSuccess: () => utils.jobs.getStatus.invalidate({ jobId }),
	});

	const handleLocateInSource = useCallback((pageStart: number) => {
		setSourcePage(pageStart);
		setShowSource(true);
	}, []);

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
				cancelPending={cancelMutation.isPending}
				completedAt={data.completedAt}
				createdAt={data.createdAt}
				fileName={data.sourceFileName}
				jobId={jobId}
				onCancel={() => cancelMutation.mutate({ jobId })}
				onRetry={() => retryMutation.mutate({ jobId })}
				onTogglePreview={() => setShowSource((v) => !v)}
				retryPending={retryMutation.isPending}
				showPreviewButton={TERMINAL_STATUSES.has(data.status)}
				showSource={showSource}
				startedAt={data.startedAt}
				status={data.status}
				totalPages={data.totalPages}
			/>
			<JobProgress status={data.status} />
			{data.segments.length > 0 && (
				<SegmentList
					jobId={jobId}
					onLocateInSource={handleLocateInSource}
					onSegmentClick={(seg) => setSelectedSegment(seg)}
					segments={data.segments}
				/>
			)}
			{data.summary.totalSegments > 0 && <JobSummary summary={data.summary} />}
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
		<>
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
							/>
						</div>
					</>
				) : (
					mainContent
				)}
			</div>

			<SegmentPreviewDialog
				jobId={jobId}
				onOpenChange={(open) => {
					if (!open) setSelectedSegment(null);
				}}
				open={selectedSegment != null}
				segment={selectedSegment}
			/>
		</>
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
	cancelPending,
	completedAt,
	createdAt,
	fileName,
	jobId,
	onCancel,
	onRetry,
	onTogglePreview,
	retryPending,
	showPreviewButton,
	showSource,
	startedAt,
	status,
	totalPages,
}: {
	cancelPending: boolean;
	completedAt: Date | null;
	createdAt: Date;
	fileName: string;
	jobId: string;
	onCancel: () => void;
	onRetry: () => void;
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
				{status === "FAILED" && (
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
