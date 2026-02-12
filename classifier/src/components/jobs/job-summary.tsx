import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Summary {
	completedCount: number;
	requiresReviewCount: number;
	segmentsByBucket: Record<string, number>;
	totalSegments: number;
}

export function JobSummary({ summary }: { summary: Summary }) {
	const bucketEntries = Object.entries(summary.segmentsByBucket).sort(
		([a], [b]) => a.localeCompare(b),
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Summary</CardTitle>
			</CardHeader>
			<CardContent>
				<dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
					<SummaryItem label="Total Segments" value={summary.totalSegments} />
					<SummaryItem label="Completed" value={summary.completedCount} />
					<SummaryItem
						label="Requires Review"
						value={summary.requiresReviewCount}
					/>
					<SummaryItem label="Categories" value={bucketEntries.length} />
				</dl>
				{bucketEntries.length > 0 && (
					<div className="mt-4 flex flex-wrap gap-2">
						{bucketEntries.map(([bucket, count]) => (
							<span
								className="rounded-lg bg-muted px-2 py-1 text-xs"
								key={bucket}
							>
								{formatBucket(bucket)}: {count}
							</span>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function SummaryItem({ label, value }: { label: string; value: number }) {
	return (
		<div>
			<dt className="text-muted-foreground">{label}</dt>
			<dd className="font-medium text-lg">{value}</dd>
		</div>
	);
}

function formatBucket(bucket: string): string {
	return bucket.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
