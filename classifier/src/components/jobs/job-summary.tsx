import { HugeiconsIcon } from "@hugeicons/react";

import { Card, CardContent } from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	formatBucket,
	getBucketColor,
	getBucketIcon,
} from "@/lib/classification/bucket-colors";
import { cn } from "@/lib/utils";

interface Summary {
	completedCount: number;
	requiresReviewCount: number;
	segmentsByBucket: Record<string, number>;
	totalSegments: number;
}

interface JobSummaryProps {
	onToggleBucket: (bucket: string) => void;
	selectedBuckets: Set<string>;
	summary: Summary;
}

export function JobSummary({
	onToggleBucket,
	selectedBuckets,
	summary,
}: JobSummaryProps) {
	const bucketEntries = Object.entries(summary.segmentsByBucket).sort(
		([, a], [, b]) => b - a,
	);

	const allCompleted = summary.completedCount === summary.totalSegments;
	const hasReview = summary.requiresReviewCount > 0;
	const hasFilter = selectedBuckets.size > 0;

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="font-medium text-lg">Document Categories</h2>
				<div className="flex items-center gap-4 text-sm">
					<span className="text-muted-foreground">
						{summary.totalSegments} segments
					</span>
					<span
						className={cn(
							allCompleted ? "text-emerald-600" : "text-muted-foreground",
						)}
					>
						{summary.completedCount} completed
					</span>
					{hasReview && (
						<span className="text-amber-600">
							{summary.requiresReviewCount} needs review
						</span>
					)}
				</div>
			</div>

			{bucketEntries.length > 0 && (
				<DistributionBar
					bucketEntries={bucketEntries}
					total={summary.totalSegments}
				/>
			)}

			{bucketEntries.length > 0 && (
				<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
					{bucketEntries.map(([bucket, count]) => (
						<CategoryCard
							bucket={bucket}
							count={count}
							dimmed={hasFilter && !selectedBuckets.has(bucket)}
							key={bucket}
							onClick={() => onToggleBucket(bucket)}
							selected={selectedBuckets.has(bucket)}
							total={summary.totalSegments}
						/>
					))}
				</div>
			)}
		</div>
	);
}

function CategoryCard({
	bucket,
	count,
	dimmed,
	onClick,
	selected,
	total,
}: {
	bucket: string;
	count: number;
	dimmed: boolean;
	onClick: () => void;
	selected: boolean;
	total: number;
}) {
	const color = getBucketColor(bucket);
	const pct = Math.round((count / total) * 100);
	const icon = getBucketIcon(bucket);

	return (
		<Card
			className={cn(
				"cursor-pointer border-l-[3px] transition-all",
				color.border,
				selected && color.bg,
				dimmed && "opacity-40",
			)}
			onClick={onClick}
			size="sm"
		>
			<CardContent className="space-y-2">
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						<HugeiconsIcon
							className={cn("size-4", color.text)}
							icon={icon}
							strokeWidth={2}
						/>
						<span className={cn("font-medium text-sm", color.text)}>
							{formatBucket(bucket)}
						</span>
					</div>
					<span className="text-muted-foreground text-xs">{pct}%</span>
				</div>
				<span className="font-semibold text-2xl tabular-nums">{count}</span>
				<div className="h-1 w-full overflow-hidden rounded-full bg-muted">
					<div
						className={cn("h-full rounded-full", color.bg)}
						style={{ width: `${pct}%` }}
					/>
				</div>
			</CardContent>
		</Card>
	);
}

function DistributionBar({
	bucketEntries,
	total,
}: {
	bucketEntries: [string, number][];
	total: number;
}) {
	if (total === 0) return null;

	return (
		<TooltipProvider>
			<div className="flex h-2.5 w-full overflow-hidden rounded-full">
				{bucketEntries.map(([bucket, count]) => {
					const color = getBucketColor(bucket);
					const pct = (count / total) * 100;
					return (
						<Tooltip key={bucket}>
							<TooltipTrigger
								className={cn(
									"h-full transition-opacity hover:opacity-80",
									color.bg,
								)}
								style={{ width: `${pct}%` }}
							/>
							<TooltipContent>
								{formatBucket(bucket)}: {count} ({pct.toFixed(0)}%)
							</TooltipContent>
						</Tooltip>
					);
				})}
			</div>
		</TooltipProvider>
	);
}
