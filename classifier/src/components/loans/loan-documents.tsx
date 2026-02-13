"use client";

import { Download04Icon, FolderOpenIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";

const SourcePdfPanel = dynamic(
	() =>
		import("@/components/pdf/source-pdf-panel").then((m) => m.SourcePdfPanel),
	{ ssr: false },
);

import { ConfidencePill } from "@/components/jobs/segment-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	formatBucket,
	formatSubtype,
	getBucketColor,
	getBucketIcon,
} from "@/lib/classification/bucket-colors";
import {
	ALL_ENCOMPASS_FOLDERS,
	FOLDER_TO_BUCKET,
} from "@/lib/classification/encompass-map";
import { cn } from "@/lib/utils";
import { api, type RouterOutputs } from "@/trpc/react";

type DocumentSegment =
	RouterOutputs["loans"]["getDocuments"]["segments"][number];

interface FolderGroup {
	bucket: string;
	folder: string;
	segments: DocumentSegment[];
}

export function LoanDocuments({ loanId }: { loanId: string }) {
	const { data, isLoading } = api.loans.getDocuments.useQuery({ loanId });
	const [selected, setSelected] = useState<DocumentSegment | null>(null);
	const [sourcePage, setSourcePage] = useState(1);
	const [sourcePageRange, setSourcePageRange] = useState<{
		start: number;
		end: number;
	} | null>(null);

	const handleSelect = useCallback((seg: DocumentSegment) => {
		setSelected((prev) => {
			if (prev?.id === seg.id) return null;
			return seg;
		});
		setSourcePage(seg.pageStart);
		setSourcePageRange({ start: seg.pageStart, end: seg.pageEnd });
	}, []);

	const handleClose = useCallback(() => {
		setSelected(null);
	}, []);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="size-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
			</div>
		);
	}

	if (!data) return null;

	const { loan, segments } = data;

	const mainContent = (
		<div className="space-y-6">
			<Header loanNumber={loan.loanNumber} segments={segments} />
			<FolderTree
				onSelect={handleSelect}
				segments={segments}
				selectedId={selected?.id ?? null}
			/>
		</div>
	);

	return (
		<div
			className={cn(
				selected
					? "grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]"
					: "space-y-6",
			)}
		>
			{selected ? (
				<>
					<div className="min-w-0">{mainContent}</div>
					<div className="sticky top-4 h-[calc(100vh-6rem)] min-w-0">
						<SourcePdfPanel
							initialPage={sourcePage}
							jobId={selected.job.id}
							onClose={handleClose}
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

function Header({
	loanNumber,
	segments,
}: {
	loanNumber: string;
	segments: DocumentSegment[];
}) {
	const stats = useMemo(() => {
		const folders = new Set(
			segments.map((s) => s.encompassFolder).filter(Boolean),
		);
		const reviewCount = segments.filter((s) => s.requiresReview).length;
		return {
			totalDocuments: segments.length,
			foldersWithDocs: folders.size,
			needsReview: reviewCount,
		};
	}, [segments]);

	return (
		<div className="space-y-1">
			<h1 className="font-semibold text-2xl tracking-tight">
				{loanNumber} — Documents
			</h1>
			<div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-sm">
				<span>{stats.totalDocuments} documents</span>
				<span>{stats.foldersWithDocs} folders</span>
				{stats.needsReview > 0 && (
					<span className="text-amber-600">
						{stats.needsReview} need review
					</span>
				)}
			</div>
		</div>
	);
}

function FolderTree({
	onSelect,
	segments,
	selectedId,
}: {
	onSelect: (seg: DocumentSegment) => void;
	segments: DocumentSegment[];
	selectedId: string | null;
}) {
	const { populated, empty } = useMemo(() => {
		const groupMap = new Map<string, DocumentSegment[]>();
		for (const seg of segments) {
			const folder = seg.encompassFolder ?? "Uncategorized";
			const arr = groupMap.get(folder);
			if (arr) {
				arr.push(seg);
			} else {
				groupMap.set(folder, [seg]);
			}
		}

		const populatedGroups: FolderGroup[] = [...groupMap.entries()]
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([folder, segs]) => ({
				bucket: FOLDER_TO_BUCKET[folder] ?? segs[0]?.bucket ?? "UNKNOWN",
				folder,
				segments: segs.sort((a, b) => a.pageStart - b.pageStart),
			}));

		const populatedFolders = new Set(groupMap.keys());
		const emptyFolders = ALL_ENCOMPASS_FOLDERS.filter(
			(f) => !populatedFolders.has(f),
		);

		return { populated: populatedGroups, empty: emptyFolders };
	}, [segments]);

	if (segments.length === 0) {
		return (
			<Card>
				<CardContent className="py-8 text-center text-muted-foreground text-sm">
					No classified documents yet
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-2">
			{populated.map((group) => (
				<FolderSection
					group={group}
					key={group.folder}
					onSelect={onSelect}
					selectedId={selectedId}
				/>
			))}
			{empty.length > 0 && (
				<Collapsible>
					<CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-muted-foreground transition-colors hover:bg-muted/50">
						<HugeiconsIcon
							className="size-4"
							icon={FolderOpenIcon}
							strokeWidth={2}
						/>
						<span className="text-sm">Empty folders</span>
						<span className="rounded-md bg-muted px-1.5 py-0.5 text-xs">
							{empty.length}
						</span>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<div className="ml-2 space-y-0.5 border-muted border-l-2 pt-1 pl-3">
							{empty.map((folder) => (
								<EmptyFolder folder={folder} key={folder} />
							))}
						</div>
					</CollapsibleContent>
				</Collapsible>
			)}
		</div>
	);
}

function FolderSection({
	group,
	onSelect,
	selectedId,
}: {
	group: FolderGroup;
	onSelect: (seg: DocumentSegment) => void;
	selectedId: string | null;
}) {
	const color = getBucketColor(group.bucket);

	return (
		<Collapsible defaultOpen>
			<CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted/50">
				<HugeiconsIcon
					className={cn("size-4", color.text)}
					icon={getBucketIcon(group.bucket)}
					strokeWidth={2}
				/>
				<span className={cn("font-medium text-sm", color.text)}>
					{group.folder}
				</span>
				<span className="rounded-md bg-muted px-1.5 py-0.5 text-muted-foreground text-xs">
					{group.segments.length}
				</span>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<div
					className={cn("ml-2 space-y-0.5 border-l-2 pt-1 pl-3", color.border)}
				>
					{group.segments.map((seg) => (
						<DocumentEntry
							key={seg.id}
							onSelect={onSelect}
							segment={seg}
							selected={seg.id === selectedId}
						/>
					))}
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}

function DocumentEntry({
	onSelect,
	segment: seg,
	selected,
}: {
	onSelect: (seg: DocumentSegment) => void;
	segment: DocumentSegment;
	selected: boolean;
}) {
	const pageRange =
		seg.pageStart === seg.pageEnd
			? `Page ${seg.pageStart}`
			: `Pages ${seg.pageStart}\u2013${seg.pageEnd}`;

	const displayName =
		seg.suggestedFilename ??
		(seg.subtype ? formatSubtype(seg.subtype) : "Unknown");

	return (
		<button
			className={cn(
				"group flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left transition-colors",
				selected
					? "bg-accent ring-1 ring-accent-foreground/10"
					: "hover:bg-muted/30",
			)}
			onClick={() => onSelect(seg)}
			type="button"
		>
			<div className="min-w-0 space-y-0.5">
				<div className="flex items-center gap-2">
					<span className="truncate font-medium text-sm">{displayName}</span>
					{seg.confidence != null && (
						<ConfidencePill
							confidence={seg.confidence}
							confidenceLevel={seg.confidenceLevel}
						/>
					)}
					{seg.requiresReview && (
						<Badge
							className="border-amber-400 text-amber-600"
							variant="outline"
						>
							Review
						</Badge>
					)}
				</div>
				<div className="flex flex-wrap items-center gap-x-3 text-muted-foreground text-xs">
					<span>{pageRange}</span>
					{seg.bucket && <span>{formatBucket(seg.bucket)}</span>}
					{seg.subtype && seg.suggestedFilename && (
						<span>{formatSubtype(seg.subtype)}</span>
					)}
					<span className="italic">{seg.job.sourceFileName}</span>
				</div>
			</div>
			{seg.outputFileKey && (
				<DownloadButton jobId={seg.job.id} segmentId={seg.id} />
			)}
		</button>
	);
}

function EmptyFolder({ folder }: { folder: string }) {
	const bucket = FOLDER_TO_BUCKET[folder] ?? "UNKNOWN";
	const color = getBucketColor(bucket);

	return (
		<div className="flex items-center gap-2 px-3 py-1 opacity-40">
			<HugeiconsIcon
				className={cn("size-3.5", color.text)}
				icon={getBucketIcon(bucket)}
				strokeWidth={2}
			/>
			<span className="text-muted-foreground text-xs">{folder}</span>
		</div>
	);
}

function DownloadButton({
	jobId,
	segmentId,
}: {
	jobId: string;
	segmentId: string;
}) {
	const [downloading, setDownloading] = useState(false);
	const [error, setError] = useState(false);
	const utils = api.useUtils();

	const handleDownload = useCallback(
		async (e: React.MouseEvent) => {
			e.stopPropagation();
			setError(false);
			setDownloading(true);
			try {
				const { url, suggestedFilename } = await utils.pdf.getSegmentUrl.fetch({
					jobId,
					segmentId,
				});
				const filename = suggestedFilename ?? "segment.pdf";

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
			} finally {
				setDownloading(false);
			}
		},
		[jobId, segmentId, utils],
	);

	return (
		<Button
			className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
			disabled={downloading}
			onClick={handleDownload}
			size="icon-xs"
			title={error ? "Download failed — click to retry" : "Download PDF"}
			variant={error ? "destructive" : "outline"}
		>
			{downloading ? (
				<div className="size-3 animate-spin rounded-full border-2 border-muted border-t-primary" />
			) : (
				<HugeiconsIcon icon={Download04Icon} strokeWidth={2} />
			)}
		</Button>
	);
}
