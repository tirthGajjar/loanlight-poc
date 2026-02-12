"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { PdfViewer } from "./pdf-viewer";

interface SourcePdfPanelProps {
	initialPage?: number;
	jobId: string;
	onClose: () => void;
	onPageChange?: (page: number) => void;
}

export function SourcePdfPanel({
	initialPage,
	jobId,
	onClose,
	onPageChange,
}: SourcePdfPanelProps) {
	const { data, error, isLoading } = api.pdf.getSourceUrl.useQuery({ jobId });

	return (
		<div className="flex h-full flex-col rounded-lg border bg-background">
			<div className="flex items-center justify-between border-b px-4 py-2">
				<h3 className="font-medium text-sm">Source PDF</h3>
				<Button onClick={onClose} size="icon-xs" variant="ghost">
					<HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
					<span className="sr-only">Close</span>
				</Button>
			</div>
			<div className="min-h-0 flex-1 overflow-auto p-3">
				{isLoading && <Skeleton className="h-96 w-full" />}
				{error && <p className="text-destructive text-sm">{error.message}</p>}
				{data && (
					<PdfViewer
						initialPage={initialPage}
						onPageChange={onPageChange}
						totalPages={data.totalPages}
						url={data.url}
					/>
				)}
			</div>
		</div>
	);
}
