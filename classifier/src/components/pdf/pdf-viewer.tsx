"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
	className?: string;
	initialPage?: number;
	onPageChange?: (page: number) => void;
	pageRange?: { start: number; end: number } | null;
	totalPages?: number | null;
	url: string;
}

export function PdfViewer({
	className,
	initialPage = 1,
	onPageChange,
	pageRange,
	totalPages: externalTotalPages,
	url,
}: PdfViewerProps) {
	const [numPages, setNumPages] = useState<number | null>(
		externalTotalPages ?? null,
	);
	const [pageNumber, setPageNumber] = useState(initialPage);
	const [scale, setScale] = useState(1);
	const [containerWidth, setContainerWidth] = useState<number>(0);
	const containerRef = useRef<HTMLDivElement>(null);

	const total = numPages ?? externalTotalPages ?? 0;

	// Sync initialPage when it changes externally
	useEffect(() => {
		setPageNumber(initialPage);
	}, [initialPage]);

	// Responsive width via ResizeObserver
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				setContainerWidth(entry.contentRect.width);
			}
		});
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	const goToPage = useCallback(
		(page: number) => {
			const clamped = Math.max(1, Math.min(page, total));
			setPageNumber(clamped);
			onPageChange?.(clamped);
		},
		[total, onPageChange],
	);

	function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
		setNumPages(numPages);
		if (pageNumber > numPages) {
			goToPage(numPages);
		}
	}

	const rangePages =
		pageRange && pageRange.start <= pageRange.end
			? Array.from(
					{ length: pageRange.end - pageRange.start + 1 },
					(_, i) => pageRange.start + i,
				)
			: null;

	return (
		<div className={cn("flex flex-col gap-3", className)}>
			{/* Toolbar */}
			{!rangePages && (
				<div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2">
					<div className="flex items-center gap-1">
						<Button
							disabled={pageNumber <= 1}
							onClick={() => goToPage(pageNumber - 1)}
							size="xs"
							variant="outline"
						>
							Prev
						</Button>
						<div className="flex items-center gap-1 px-1 text-sm">
							<input
								className="w-10 rounded border bg-background px-1 py-0.5 text-center text-xs"
								max={total}
								min={1}
								onChange={(e) => {
									const val = Number.parseInt(e.target.value, 10);
									if (!Number.isNaN(val)) goToPage(val);
								}}
								type="number"
								value={pageNumber}
							/>
							<span className="text-muted-foreground text-xs">/ {total}</span>
						</div>
						<Button
							disabled={pageNumber >= total}
							onClick={() => goToPage(pageNumber + 1)}
							size="xs"
							variant="outline"
						>
							Next
						</Button>
					</div>
					<ZoomControls scale={scale} setScale={setScale} />
				</div>
			)}
			{rangePages && (
				<div className="flex items-center justify-end rounded-lg border bg-muted/30 px-3 py-2">
					<ZoomControls scale={scale} setScale={setScale} />
				</div>
			)}

			{/* PDF Content */}
			<div
				className="overflow-auto rounded-lg border bg-muted/10"
				ref={containerRef}
			>
				<Document
					error={
						<div className="flex h-64 items-center justify-center text-destructive text-sm">
							Failed to load PDF
						</div>
					}
					file={url}
					loading={
						<div className="space-y-2 p-4">
							<Skeleton className="h-96 w-full" />
						</div>
					}
					onLoadSuccess={onDocumentLoadSuccess}
				>
					{rangePages ? (
						rangePages.map((p) => (
							<Page
								key={p}
								loading={<Skeleton className="h-96 w-full" />}
								pageNumber={p}
								renderAnnotationLayer={false}
								renderTextLayer={false}
								scale={scale}
								width={containerWidth > 0 ? containerWidth : undefined}
							/>
						))
					) : (
						<Page
							loading={<Skeleton className="h-96 w-full" />}
							pageNumber={pageNumber}
							renderAnnotationLayer={false}
							renderTextLayer={false}
							scale={scale}
							width={containerWidth > 0 ? containerWidth : undefined}
						/>
					)}
				</Document>
			</div>
		</div>
	);
}

function ZoomControls({
	scale,
	setScale,
}: {
	scale: number;
	setScale: (fn: (s: number) => number) => void;
}) {
	return (
		<div className="flex items-center gap-1">
			<Button
				disabled={scale <= 0.5}
				onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
				size="xs"
				variant="outline"
			>
				-
			</Button>
			<span className="min-w-10 text-center text-xs">
				{Math.round(scale * 100)}%
			</span>
			<Button
				disabled={scale >= 3}
				onClick={() => setScale((s) => Math.min(3, s + 0.25))}
				size="xs"
				variant="outline"
			>
				+
			</Button>
			{scale !== 1 && (
				<Button onClick={() => setScale(() => 1)} size="xs" variant="ghost">
					Reset
				</Button>
			)}
		</div>
	);
}
