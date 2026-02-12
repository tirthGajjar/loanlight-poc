"use client";

import { useCallback, useEffect, useId, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ENCOMPASS_FOLDER_MAP } from "@/lib/classification/encompass-map";
import { CLASSIFICATION_RULES } from "@/lib/classification/rules";
import { api } from "@/trpc/react";
import { PdfViewer } from "./pdf-viewer";

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

interface SegmentPreviewDialogProps {
	jobId: string;
	onOpenChange: (open: boolean) => void;
	open: boolean;
	segment: SegmentInfo | null;
}

export function SegmentPreviewDialog({
	jobId,
	onOpenChange,
	open,
	segment,
}: SegmentPreviewDialogProps) {
	const { data, error, isLoading } = api.pdf.getSegmentUrl.useQuery(
		{ jobId, segmentId: segment?.id ?? "" },
		{ enabled: open && segment != null },
	);

	const pageRange =
		segment && segment.pageStart === segment.pageEnd
			? `Page ${segment.pageStart}`
			: segment
				? `Pages ${segment.pageStart}\u2013${segment.pageEnd}`
				: "";

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className="flex max-h-[90vh] flex-col sm:max-w-4xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<span>Segment #{segment?.segmentIndex}</span>
						{segment?.bucket && (
							<Badge variant="secondary">{formatLabel(segment.bucket)}</Badge>
						)}
						{segment?.subtype && (
							<Badge variant="outline">{formatLabel(segment.subtype)}</Badge>
						)}
						{segment?.manuallyClassified && (
							<Badge
								className="border-blue-400 text-blue-600"
								variant="outline"
							>
								Manually Classified
							</Badge>
						)}
						<span className="font-normal text-muted-foreground text-xs">
							{pageRange}
						</span>
					</DialogTitle>
				</DialogHeader>

				{segment?.reasoning && (
					<p className="text-muted-foreground text-xs leading-relaxed">
						{segment.reasoning}
					</p>
				)}

				{segment?.status === "COMPLETED" && (
					<CorrectionForm jobId={jobId} segment={segment} />
				)}

				<div className="min-h-0 flex-1 overflow-auto">
					{isLoading && <Skeleton className="h-96 w-full" />}
					{error && <p className="text-destructive text-sm">{error.message}</p>}
					{data && <PdfViewer url={data.url} />}
				</div>
			</DialogContent>
		</Dialog>
	);
}

function CorrectionForm({
	jobId,
	segment,
}: {
	jobId: string;
	segment: SegmentInfo;
}) {
	const id = useId();
	const [bucket, setBucket] = useState(segment.bucket ?? "");
	const [subtype, setSubtype] = useState(segment.subtype ?? "");

	// Reset form when a different segment is selected
	// biome-ignore lint/correctness/useExhaustiveDependencies: segment.id ensures reset on segment switch even if bucket/subtype match
	useEffect(() => {
		setBucket(segment.bucket ?? "");
		setSubtype(segment.subtype ?? "");
	}, [segment.id, segment.bucket, segment.subtype]);

	const bucketKey = bucket.toLowerCase();
	const subtypeRules = CLASSIFICATION_RULES[bucketKey] ?? [];
	const encompassFolder = ENCOMPASS_FOLDER_MAP[subtype] ?? null;

	const hasChanges =
		bucket !== (segment.bucket ?? "") || subtype !== (segment.subtype ?? "");

	const utils = api.useUtils();
	const mutation = api.jobs.updateSegment.useMutation({
		onSuccess: () => {
			utils.jobs.getStatus.invalidate({ jobId });
		},
	});

	const handleBucketChange = useCallback(
		(value: string | null) => {
			if (!value) return;
			setBucket(value);
			// Reset subtype when bucket changes since subtypes differ per bucket
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
		<div className="flex flex-wrap items-end gap-3 rounded-lg border bg-muted/30 p-3">
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
								{formatLabel(b)}
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
								{formatLabel(r.type)}
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

			<Button
				disabled={!(hasChanges && bucket && subtype) || mutation.isPending}
				onClick={handleSave}
				size="sm"
			>
				{mutation.isPending ? "Saving..." : "Save"}
			</Button>

			{mutation.isError && (
				<span className="text-destructive text-xs">
					{mutation.error.message}
				</span>
			)}
		</div>
	);
}

function formatLabel(value: string): string {
	return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
