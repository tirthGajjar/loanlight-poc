import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SegmentCardProps {
	bucket: string | null;
	confidence: number | null;
	confidenceLevel: string | null;
	encompassFolder: string | null;
	errorMessage: string | null;
	onClick?: () => void;
	pageEnd: number;
	pageStart: number;
	requiresReview: boolean;
	segmentIndex: number;
	status: string;
	subtype: string | null;
}

export function SegmentCard({
	bucket,
	confidence,
	confidenceLevel,
	encompassFolder,
	errorMessage,
	onClick,
	pageEnd,
	pageStart,
	requiresReview,
	segmentIndex,
	status,
	subtype,
}: SegmentCardProps) {
	const pageRange =
		pageStart === pageEnd
			? `Page ${pageStart}`
			: `Pages ${pageStart}\u2013${pageEnd}`;

	return (
		<Card
			className={cn(
				onClick && "cursor-pointer transition-colors hover:bg-muted/50",
			)}
			onClick={onClick}
			size="sm"
		>
			<CardContent className="flex items-start justify-between gap-4">
				<div className="min-w-0 space-y-1">
					<div className="flex items-center gap-2">
						<span className="font-medium">#{segmentIndex}</span>
						{bucket && <BucketBadge bucket={bucket} />}
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
					{subtype && (
						<p className="text-sm">
							{formatSubtype(subtype)}
							{confidence != null && (
								<span className="ml-2 text-muted-foreground">
									{(confidence * 100).toFixed(2)}%
									{confidenceLevel && ` (${confidenceLevel})`}
								</span>
							)}
						</p>
					)}
					<p className="text-muted-foreground text-xs">{pageRange}</p>
					{encompassFolder && (
						<p className="text-muted-foreground text-xs">
							Encompass: {encompassFolder}
						</p>
					)}
					{status === "FAILED" && errorMessage && (
						<p className="text-destructive text-xs">{errorMessage}</p>
					)}
				</div>
				{status === "CLASSIFYING" && (
					<div className="size-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
				)}
			</CardContent>
		</Card>
	);
}

function BucketBadge({ bucket }: { bucket: string }) {
	return <Badge variant="secondary">{formatBucket(bucket)}</Badge>;
}

function formatBucket(bucket: string): string {
	return bucket.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatSubtype(subtype: string): string {
	return subtype.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
