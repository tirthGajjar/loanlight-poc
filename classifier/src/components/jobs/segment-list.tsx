"use client";

import { Download04Icon, Location01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { SegmentCard } from "./segment-card";

interface Segment {
	bucket: string | null;
	confidence: number | null;
	confidenceLevel: string | null;
	encompassFolder: string | null;
	errorMessage: string | null;
	id: string;
	manuallyClassified: boolean;
	outputFileKey: string | null;
	pageEnd: number;
	pageStart: number;
	reasoning: string | null;
	requiresReview: boolean;
	segmentIndex: number;
	status: string;
	subtype: string | null;
}

interface SegmentListProps {
	jobId: string;
	onLocateInSource?: (pageStart: number) => void;
	onSegmentClick?: (segment: Segment) => void;
	segments: Segment[];
}

export function SegmentList({
	jobId,
	onLocateInSource,
	onSegmentClick,
	segments,
}: SegmentListProps) {
	return (
		<div className="space-y-3">
			<h2 className="font-medium text-lg">Segments ({segments.length})</h2>
			<div className="space-y-2">
				{segments.map((seg) => (
					<div className="group relative" key={seg.id}>
						<SegmentCard
							bucket={seg.bucket}
							confidence={seg.confidence}
							confidenceLevel={seg.confidenceLevel}
							encompassFolder={seg.encompassFolder}
							errorMessage={seg.errorMessage}
							onClick={onSegmentClick ? () => onSegmentClick(seg) : undefined}
							pageEnd={seg.pageEnd}
							pageStart={seg.pageStart}
							requiresReview={seg.requiresReview}
							segmentIndex={seg.segmentIndex}
							status={seg.status}
							subtype={seg.subtype}
						/>
						<div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
							{seg.status === "COMPLETED" && seg.outputFileKey && (
								<DownloadButton
									jobId={jobId}
									segmentId={seg.id}
								/>
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
					</div>
				))}
			</div>
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
				const { url, suggestedFilename } =
					await utils.pdf.getSegmentUrl.fetch({ jobId, segmentId });

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
			title={error ? "Download failed — click to retry" : "Download segment PDF"}
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
