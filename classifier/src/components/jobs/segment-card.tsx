"use client";

import { Edit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	formatBucket,
	formatSubtype,
	getBucketColor,
	getBucketIcon,
} from "@/lib/classification/bucket-colors";
import { cn } from "@/lib/utils";

interface SegmentCardProps {
	bucket: string | null;
	classificationDuration: number | null;
	classifiedAt: Date | null;
	confidence: number | null;
	confidenceLevel: string | null;
	editing?: boolean;
	encompassFolder: string | null;
	errorMessage: string | null;
	manuallyClassified?: boolean;
	onClick?: () => void;
	onEdit?: () => void;
	onSelect?: (checked: boolean) => void;
	originalBucket: string | null;
	originalSubtype: string | null;
	pageEnd: number;
	pageStart: number;
	reasoning: string | null;
	requiresReview: boolean;
	segmentIndex: number;
	selected?: boolean;
	status: string;
	subtype: string | null;
	suggestedFilename: string | null;
}

export function SegmentCard({
	bucket,
	classificationDuration,
	classifiedAt,
	confidence,
	confidenceLevel,
	editing,
	encompassFolder,
	errorMessage,
	manuallyClassified,
	onClick,
	onEdit,
	onSelect,
	originalBucket,
	originalSubtype,
	pageEnd,
	pageStart,
	reasoning,
	requiresReview,
	segmentIndex,
	selected,
	status,
	subtype,
	suggestedFilename,
}: SegmentCardProps) {
	const [showReasoning, setShowReasoning] = useState(false);

	const pageRange =
		pageStart === pageEnd
			? `Page ${pageStart}`
			: `Pages ${pageStart}\u2013${pageEnd}`;

	const color = getBucketColor(bucket);

	const hasOriginalOverride =
		manuallyClassified &&
		(originalBucket != null || originalSubtype != null) &&
		(originalBucket !== bucket || originalSubtype !== subtype);

	return (
		<Card
			className={cn(
				"border-l-[3px]",
				color.border,
				onClick && "cursor-pointer transition-colors hover:bg-muted/50",
			)}
			onClick={onClick}
			size="sm"
		>
			<CardContent className="flex items-start justify-between gap-4">
				<div className="min-w-0 space-y-1">
					{/* Row 1: Checkbox (if select mode), status dot, index, subtype headline */}
					<div className="flex items-center gap-2">
						{onSelect && (
							<input
								aria-label={`Select segment #${segmentIndex}`}
								checked={selected ?? false}
								className="size-4 shrink-0 cursor-pointer rounded border-muted-foreground/40 accent-primary"
								onChange={(e) => {
									e.stopPropagation();
									onSelect(e.target.checked);
								}}
								onClick={(e) => e.stopPropagation()}
								type="checkbox"
							/>
						)}
						<SegmentStatusDot status={status} />
						<span className="text-muted-foreground text-xs">
							#{segmentIndex}
						</span>
						{subtype && (
							<span className="font-medium text-sm">
								{formatSubtype(subtype)}
							</span>
						)}
					</div>

					{/* Row 2: Bucket badge, confidence, review/failed badges */}
					<div className="flex flex-wrap items-center gap-2">
						{bucket && (
							<span
								className={cn(
									"inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium text-xs",
									color.bg,
									color.text,
								)}
							>
								<HugeiconsIcon
									className="size-3"
									icon={getBucketIcon(bucket)}
									strokeWidth={2}
								/>
								{formatBucket(bucket)}
							</span>
						)}
						{confidence != null && (
							<ConfidencePill
								confidence={confidence}
								confidenceLevel={confidenceLevel}
							/>
						)}
						{requiresReview && (
							<Badge
								className="border-amber-400 text-amber-600"
								variant="outline"
							>
								Review
							</Badge>
						)}
						{status === "FAILED" && <Badge variant="destructive">Failed</Badge>}
					</div>

					{/* Row 3: Original classification (when manually overridden) */}
					{hasOriginalOverride && (
						<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
							<span>AI picked:</span>
							{originalBucket && (
								<span className="line-through">
									{formatBucket(originalBucket)}
								</span>
							)}
							{originalSubtype && (
								<span className="line-through">
									{formatSubtype(originalSubtype)}
								</span>
							)}
						</div>
					)}

					{/* Row 4: Metadata — pages, filename, encompass, duration, manual timestamp */}
					<div className="flex flex-wrap items-center gap-x-3 text-muted-foreground text-xs">
						<span>{pageRange}</span>
						{suggestedFilename && (
							<span className="font-mono">{suggestedFilename}</span>
						)}
						{encompassFolder && <span>Encompass: {encompassFolder}</span>}
						{classificationDuration != null && classificationDuration > 0 && (
							<span>{formatDuration(classificationDuration)}</span>
						)}
						{manuallyClassified && classifiedAt && (
							<span>Edited {new Date(classifiedAt).toLocaleDateString()}</span>
						)}
					</div>

					{/* Row 5: Error message */}
					{status === "FAILED" && errorMessage && (
						<p className="text-destructive text-xs">{errorMessage}</p>
					)}

					{/* Row 6: Reasoning (collapsible) */}
					{reasoning && (
						<div>
							<button
								className="text-muted-foreground text-xs underline decoration-dotted underline-offset-2 hover:text-foreground"
								onClick={(e) => {
									e.stopPropagation();
									setShowReasoning((v) => !v);
								}}
								type="button"
							>
								{showReasoning ? "Hide reasoning" : "Show reasoning"}
							</button>
							{showReasoning && (
								<p className="mt-1 rounded-md bg-muted/50 p-2 text-muted-foreground text-xs leading-relaxed">
									{reasoning}
								</p>
							)}
						</div>
					)}
				</div>

				{/* Right side: Manual badge, spinner, edit button */}
				<div className="flex shrink-0 items-center gap-2">
					{manuallyClassified && (
						<Badge className="border-blue-400 text-blue-600" variant="outline">
							Manual
						</Badge>
					)}
					{status === "CLASSIFYING" && (
						<div className="size-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
					)}
					{onEdit && status === "COMPLETED" && (
						<Button
							className="shrink-0"
							onClick={(e) => {
								e.stopPropagation();
								onEdit();
							}}
							size="xs"
							variant={editing ? "secondary" : "ghost"}
						>
							<HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
							Edit
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

function SegmentStatusDot({ status }: { status: string }) {
	const dotClass =
		status === "COMPLETED"
			? "bg-emerald-500"
			: status === "FAILED"
				? "bg-red-500"
				: status === "CLASSIFYING"
					? "bg-primary animate-pulse"
					: "bg-muted-foreground/40";

	return <span className={cn("inline-block size-2 rounded-full", dotClass)} />;
}

export function ConfidencePill({
	confidence,
	confidenceLevel,
}: {
	confidence: number;
	confidenceLevel: string | null;
}) {
	const pct = (confidence * 100).toFixed(1);
	const colorClass =
		confidenceLevel === "HIGH"
			? "text-emerald-700 bg-emerald-50"
			: confidenceLevel === "LOW"
				? "text-red-700 bg-red-50"
				: "text-amber-700 bg-amber-50";

	return (
		<span
			className={cn(
				"inline-flex items-center rounded-md px-1.5 py-0.5 font-medium text-xs",
				colorClass,
			)}
		>
			{pct}%
		</span>
	);
}

function formatDuration(ms: number): string {
	if (ms < 1000) return `${ms}ms`;
	return `${(ms / 1000).toFixed(1)}s`;
}
