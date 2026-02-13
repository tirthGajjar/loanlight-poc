"use client";

import {
	ArrowDown01Icon,
	Download04Icon,
	Location01Icon,
	Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useId, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	formatBucket,
	formatSubtype,
	getBucketColor,
} from "@/lib/classification/bucket-colors";
import { ENCOMPASS_FOLDER_MAP } from "@/lib/classification/encompass-map";
import { CLASSIFICATION_RULES } from "@/lib/classification/rules";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { SegmentCard } from "./segment-card";

const DOCUMENT_BUCKETS = [
	"INCOME",
	"ASSETS",
	"TAX_RETURNS",
	"PROPERTY",
	"CREDIT",
	"IDENTITY",
	"DISCLOSURES",
	"BUSINESS",
	"APPRAISAL",
	"TITLE",
	"APPLICATION",
	"FRAUD",
	"UNKNOWN",
] as const;

interface Segment {
	bucket: string | null;
	bucketConfidence: number | null;
	classificationCompletedAt: Date | null;
	classificationStartedAt: Date | null;
	classifiedAt: Date | null;
	classifiedBy: string | null;
	confidence: number | null;
	confidenceLevel: string | null;
	encompassFolder: string | null;
	errorMessage: string | null;
	id: string;
	manuallyClassified: boolean;
	originalBucket: string | null;
	originalSubtype: string | null;
	outputFileKey: string | null;
	pageEnd: number;
	pageStart: number;
	reasoning: string | null;
	requiresReview: boolean;
	segmentIndex: number;
	status: string;
	subtype: string | null;
	suggestedFilename: string | null;
}

type Filter = "all" | "review" | "failed";
type GroupBy = "bucket" | "none";

interface SegmentListProps {
	bucketFilter?: Set<string>;
	jobId: string;
	onLocateInSource?: (pageStart: number) => void;
	onSegmentClick?: (segment: Segment) => void;
	segments: Segment[];
}

/** Check whether the selected segments form a contiguous page range. */
function areAdjacent(segments: Segment[], selectedIds: Set<string>): boolean {
	const selected = segments
		.filter((s) => selectedIds.has(s.id))
		.sort((a, b) => a.pageStart - b.pageStart);
	if (selected.length < 2) return false;
	for (let i = 1; i < selected.length; i++) {
		const curr = selected[i]!;
		const prev = selected[i - 1]!;
		if (curr.pageStart !== prev.pageEnd + 1) return false;
	}
	return true;
}

export function SegmentList({
	bucketFilter,
	jobId,
	onLocateInSource,
	onSegmentClick,
	segments,
}: SegmentListProps) {
	const [filter, setFilter] = useState<Filter>("all");
	const [groupBy, setGroupBy] = useState<GroupBy>("bucket");
	const [selectMode, setSelectMode] = useState(false);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

	const exitSelectMode = useCallback(() => {
		setSelectMode(false);
		setSelectedIds(new Set());
	}, []);

	const toggleSelect = useCallback((id: string, checked: boolean) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (checked) {
				next.add(id);
			} else {
				next.delete(id);
			}
			return next;
		});
	}, []);

	const completedSegments = useMemo(
		() => segments.filter((s) => s.status === "COMPLETED"),
		[segments],
	);

	const selectAll = useCallback(() => {
		setSelectedIds(new Set(completedSegments.map((s) => s.id)));
	}, [completedSegments]);

	const bucketFiltered = useMemo(() => {
		if (!bucketFilter || bucketFilter.size === 0) return segments;
		return segments.filter((s) => {
			const key = s.bucket?.toUpperCase() ?? "UNKNOWN";
			return bucketFilter.has(key) || bucketFilter.has(s.bucket ?? "");
		});
	}, [segments, bucketFilter]);

	const counts = useMemo(
		() => ({
			all: bucketFiltered.length,
			review: bucketFiltered.filter((s) => s.requiresReview).length,
			failed: bucketFiltered.filter((s) => s.status === "FAILED").length,
		}),
		[bucketFiltered],
	);

	const filtered = useMemo(() => {
		if (filter === "review")
			return bucketFiltered.filter((s) => s.requiresReview);
		if (filter === "failed")
			return bucketFiltered.filter((s) => s.status === "FAILED");
		return bucketFiltered;
	}, [bucketFiltered, filter]);

	const bucketGroups = useMemo(() => {
		if (groupBy !== "bucket") return null;

		const groups = new Map<string, Segment[]>();
		for (const seg of filtered) {
			const key = seg.bucket?.toUpperCase() ?? "UNKNOWN";
			const arr = groups.get(key);
			if (arr) {
				arr.push(seg);
			} else {
				groups.set(key, [seg]);
			}
		}

		return [...groups.entries()]
			.sort(([, a], [, b]) => b.length - a.length)
			.map(([bucket, segs]) => ({
				bucket,
				segments: segs.sort((a, b) => a.segmentIndex - b.segmentIndex),
			}));
	}, [filtered, groupBy]);

	const adjacent = useMemo(
		() => selectedIds.size >= 2 && areAdjacent(segments, selectedIds),
		[segments, selectedIds],
	);

	return (
		<div className="relative space-y-3">
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<h2 className="font-medium text-lg">
						Segments ({filtered.length})
					</h2>
					{selectMode && (
						<div className="flex items-center gap-1">
							<Button onClick={selectAll} size="sm" variant="ghost">
								Select all
							</Button>
							<Button
								onClick={() => setSelectedIds(new Set())}
								size="sm"
								variant="ghost"
							>
								Clear
							</Button>
						</div>
					)}
				</div>
				<div className="flex items-center gap-2">
					{completedSegments.length >= 2 && (
						<Button
							onClick={() =>
								selectMode ? exitSelectMode() : setSelectMode(true)
							}
							size="sm"
							variant={selectMode ? "secondary" : "outline"}
						>
							<HugeiconsIcon
								className="size-3.5"
								icon={Tick02Icon}
								strokeWidth={2}
							/>
							{selectMode ? "Done" : "Select"}
						</Button>
					)}
					<FilterToolbar
						counts={counts}
						filter={filter}
						onFilterChange={setFilter}
					/>
					<GroupByDropdown groupBy={groupBy} onGroupByChange={setGroupBy} />
				</div>
			</div>

			{bucketGroups ? (
				<div className="space-y-2">
					{bucketGroups.map((group) => (
						<BucketGroup
							bucket={group.bucket}
							jobId={jobId}
							key={group.bucket}
							onLocateInSource={onLocateInSource}
							onSegmentClick={onSegmentClick}
							onToggleSelect={selectMode ? toggleSelect : undefined}
							segments={group.segments}
							selectedIds={selectMode ? selectedIds : undefined}
						/>
					))}
				</div>
			) : (
				<div className="space-y-2">
					{filtered
						.sort((a, b) => a.segmentIndex - b.segmentIndex)
						.map((seg) => (
							<SegmentRow
								jobId={jobId}
								key={seg.id}
								onLocateInSource={onLocateInSource}
								onSegmentClick={onSegmentClick}
								onToggleSelect={selectMode ? toggleSelect : undefined}
								segment={seg}
								selected={selectMode ? selectedIds.has(seg.id) : undefined}
							/>
						))}
				</div>
			)}

			{selectMode && selectedIds.size >= 2 && (
				<MergeBar
					adjacent={adjacent}
					jobId={jobId}
					onMerged={exitSelectMode}
					segmentIds={[...selectedIds]}
					selectedCount={selectedIds.size}
				/>
			)}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Merge bar
// ---------------------------------------------------------------------------

function MergeBar({
	adjacent,
	jobId,
	onMerged,
	segmentIds,
	selectedCount,
}: {
	adjacent: boolean;
	jobId: string;
	onMerged: () => void;
	segmentIds: string[];
	selectedCount: number;
}) {
	const utils = api.useUtils();
	const mutation = api.jobs.mergeSegments.useMutation({
		onSuccess: () => {
			utils.jobs.getStatus.invalidate({ jobId });
			onMerged();
		},
	});

	return (
		<div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 rounded-lg border bg-background/95 px-4 py-3 shadow-lg backdrop-blur">
			<span className="text-sm">
				{selectedCount} segments selected
				{!adjacent && (
					<span className="ml-2 text-destructive text-xs">
						Selected segments must be adjacent
					</span>
				)}
			</span>
			<div className="flex gap-2">
				<Button onClick={onMerged} size="sm" variant="ghost">
					Cancel
				</Button>
				<Button
					disabled={!adjacent || mutation.isPending}
					onClick={() => mutation.mutate({ jobId, segmentIds })}
					size="sm"
				>
					{mutation.isPending ? "Merging..." : "Merge"}
				</Button>
			</div>
			{mutation.isError && (
				<span className="text-destructive text-xs">
					{mutation.error.message}
				</span>
			)}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Toolbar helpers
// ---------------------------------------------------------------------------

function FilterToolbar({
	counts,
	filter,
	onFilterChange,
}: {
	counts: { all: number; review: number; failed: number };
	filter: Filter;
	onFilterChange: (f: Filter) => void;
}) {
	return (
		<div className="flex gap-1">
			{(
				[
					{ key: "all" as const, label: "All", count: counts.all },
					{ key: "review" as const, label: "Review", count: counts.review },
					{ key: "failed" as const, label: "Failed", count: counts.failed },
				] satisfies { key: Filter; label: string; count: number }[]
			)
				.filter((item) => item.key === "all" || item.count > 0)
				.map((item) => (
					<Button
						key={item.key}
						onClick={() => onFilterChange(item.key)}
						size="sm"
						variant={filter === item.key ? "secondary" : "ghost"}
					>
						{item.label}
						<span className="ml-1 text-muted-foreground text-xs">
							{item.count}
						</span>
					</Button>
				))}
		</div>
	);
}

function GroupByDropdown({
	groupBy,
	onGroupByChange,
}: {
	groupBy: GroupBy;
	onGroupByChange: (g: GroupBy) => void;
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger render={<Button size="sm" variant="outline" />}>
				Group: {groupBy === "bucket" ? "Bucket" : "None"}
				<HugeiconsIcon
					className="ml-1 size-3.5 opacity-60"
					icon={ArrowDown01Icon}
					strokeWidth={2}
				/>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => onGroupByChange("bucket")}>
					Bucket
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => onGroupByChange("none")}>
					None
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

// ---------------------------------------------------------------------------
// Bucket group
// ---------------------------------------------------------------------------

function BucketGroup({
	bucket,
	jobId,
	onLocateInSource,
	onSegmentClick,
	onToggleSelect,
	segments,
	selectedIds,
}: {
	bucket: string;
	jobId: string;
	onLocateInSource?: (pageStart: number) => void;
	onSegmentClick?: (segment: Segment) => void;
	onToggleSelect?: (id: string, checked: boolean) => void;
	segments: Segment[];
	selectedIds?: Set<string>;
}) {
	const color = getBucketColor(bucket);

	return (
		<Collapsible defaultOpen>
			<CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted/50">
				<div className={cn("h-4 w-1 rounded-full", color.bg)} />
				<span className={cn("font-medium text-sm", color.text)}>
					{formatBucket(bucket)}
				</span>
				<span className="rounded-md bg-muted px-1.5 py-0.5 text-muted-foreground text-xs">
					{segments.length}
				</span>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<div
					className={cn("ml-2 space-y-2 border-l-2 pt-2 pl-3", color.border)}
				>
					{segments.map((seg) => (
						<SegmentRow
							jobId={jobId}
							key={seg.id}
							onLocateInSource={onLocateInSource}
							onSegmentClick={onSegmentClick}
							onToggleSelect={onToggleSelect}
							segment={seg}
							selected={selectedIds?.has(seg.id)}
						/>
					))}
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}

// ---------------------------------------------------------------------------
// Segment row
// ---------------------------------------------------------------------------

function SegmentRow({
	jobId,
	onLocateInSource,
	onSegmentClick,
	onToggleSelect,
	segment: seg,
	selected,
}: {
	jobId: string;
	onLocateInSource?: (pageStart: number) => void;
	onSegmentClick?: (segment: Segment) => void;
	onToggleSelect?: (id: string, checked: boolean) => void;
	segment: Segment;
	selected?: boolean;
}) {
	const [editing, setEditing] = useState(false);

	const showCheckbox = onToggleSelect && seg.status === "COMPLETED";

	return (
		<div className="group relative">
			<SegmentCard
				bucket={seg.bucket}
				classificationDuration={
					seg.classificationStartedAt && seg.classificationCompletedAt
						? new Date(seg.classificationCompletedAt).getTime() -
							new Date(seg.classificationStartedAt).getTime()
						: null
				}
				classifiedAt={seg.classifiedAt}
				confidence={seg.confidence}
				confidenceLevel={seg.confidenceLevel}
				editing={editing}
				encompassFolder={seg.encompassFolder}
				errorMessage={seg.errorMessage}
				manuallyClassified={seg.manuallyClassified}
				onClick={onSegmentClick ? () => onSegmentClick(seg) : undefined}
				onEdit={() => setEditing((v) => !v)}
				onSelect={
					showCheckbox
						? (checked: boolean) => onToggleSelect(seg.id, checked)
						: undefined
				}
				originalBucket={seg.originalBucket}
				originalSubtype={seg.originalSubtype}
				pageEnd={seg.pageEnd}
				pageStart={seg.pageStart}
				reasoning={seg.reasoning}
				requiresReview={seg.requiresReview}
				segmentIndex={seg.segmentIndex}
				selected={selected}
				status={seg.status}
				subtype={seg.subtype}
				suggestedFilename={seg.suggestedFilename}
			/>
			<div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
				{seg.status === "COMPLETED" && seg.outputFileKey && (
					<DownloadButton jobId={jobId} segmentId={seg.id} />
				)}
				{onLocateInSource && (
					<Button
						onClick={(e) => {
							e.stopPropagation();
							onLocateInSource(seg.pageStart);
						}}
						size="icon-xs"
						title="Locate in source PDF"
						variant="outline"
					>
						<HugeiconsIcon icon={Location01Icon} strokeWidth={2} />
					</Button>
				)}
			</div>
			{editing && (
				<InlineCorrectionForm
					jobId={jobId}
					onClose={() => setEditing(false)}
					segment={seg}
				/>
			)}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Inline correction form
// ---------------------------------------------------------------------------

function InlineCorrectionForm({
	jobId,
	onClose,
	segment,
}: {
	jobId: string;
	onClose: () => void;
	segment: Segment;
}) {
	const id = useId();
	const [bucket, setBucket] = useState(segment.bucket ?? "");
	const [subtype, setSubtype] = useState(segment.subtype ?? "");

	const bucketKey = bucket.toLowerCase();
	const subtypeRules = CLASSIFICATION_RULES[bucketKey] ?? [];
	const encompassFolder = ENCOMPASS_FOLDER_MAP[subtype] ?? null;

	const hasChanges =
		bucket !== (segment.bucket ?? "") || subtype !== (segment.subtype ?? "");

	const utils = api.useUtils();
	const mutation = api.jobs.updateSegment.useMutation({
		onSuccess: () => {
			utils.jobs.getStatus.invalidate({ jobId });
			onClose();
		},
	});

	const handleBucketChange = useCallback(
		(value: string | null) => {
			if (!value) return;
			setBucket(value);
			const newKey = value.toLowerCase();
			const newRules = CLASSIFICATION_RULES[newKey] ?? [];
			if (!newRules.some((r) => r.type === subtype)) {
				setSubtype(newRules[0]?.type ?? "");
			}
		},
		[subtype],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: mutation is stable from useMutation
	const handleSave = useCallback(() => {
		if (!(bucket && subtype)) return;
		mutation.mutate({
			bucket: bucket as (typeof DOCUMENT_BUCKETS)[number],
			jobId,
			segmentId: segment.id,
			subtype,
		});
	}, [bucket, subtype, jobId, segment.id, mutation]);

	return (
		<div className="mt-1 flex flex-wrap items-end gap-3 rounded-lg border bg-muted/30 p-3">
			<div className="space-y-1">
				<label
					className="text-muted-foreground text-xs"
					htmlFor={`${id}-bucket`}
				>
					Bucket
				</label>
				<Select onValueChange={handleBucketChange} value={bucket}>
					<SelectTrigger id={`${id}-bucket`} size="sm">
						<SelectValue placeholder="Select bucket" />
					</SelectTrigger>
					<SelectContent>
						{DOCUMENT_BUCKETS.map((b) => (
							<SelectItem key={b} value={b}>
								{formatBucket(b)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-1">
				<label
					className="text-muted-foreground text-xs"
					htmlFor={`${id}-subtype`}
				>
					Subtype
				</label>
				<Select
					disabled={subtypeRules.length === 0}
					onValueChange={(v) => v && setSubtype(v)}
					value={subtype}
				>
					<SelectTrigger id={`${id}-subtype`} size="sm">
						<SelectValue placeholder="Select subtype" />
					</SelectTrigger>
					<SelectContent>
						{subtypeRules.map((r) => (
							<SelectItem key={r.type} value={r.type}>
								{formatSubtype(r.type)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{encompassFolder && (
				<span className="pb-1.5 text-muted-foreground text-xs">
					Encompass: {encompassFolder}
				</span>
			)}

			<div className="flex gap-2">
				<Button
					disabled={!(hasChanges && bucket && subtype) || mutation.isPending}
					onClick={handleSave}
					size="sm"
				>
					{mutation.isPending ? "Saving..." : "Save"}
				</Button>
				<Button
					disabled={mutation.isPending}
					onClick={onClose}
					size="sm"
					variant="ghost"
				>
					Cancel
				</Button>
			</div>

			{mutation.isError && (
				<span className="text-destructive text-xs">
					{mutation.error.message}
				</span>
			)}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Download button
// ---------------------------------------------------------------------------

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
				if (!res.ok) {
					throw new Error(`Download failed: ${res.status}`);
				}

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
			disabled={downloading}
			onClick={handleDownload}
			size="icon-xs"
			title={
				error ? "Download failed — click to retry" : "Download segment PDF"
			}
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
