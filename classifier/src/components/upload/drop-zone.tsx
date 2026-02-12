"use client";

import { CloudUploadIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DropZoneProps {
	disabled?: boolean;
	onFilesSelect: (files: File[]) => void;
}

export function DropZone({ disabled, onFilesSelect }: DropZoneProps) {
	const [isDragging, setIsDragging] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragging(false);
			if (disabled) return;
			const files = Array.from(e.dataTransfer.files);
			if (files.length > 0) onFilesSelect(files);
		},
		[disabled, onFilesSelect],
	);

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const files = Array.from(e.target.files ?? []);
			if (files.length > 0) onFilesSelect(files);
			e.target.value = "";
		},
		[onFilesSelect],
	);

	return (
		<div
			className={cn(
				"relative flex w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-xl border-2 border-dashed px-8 py-10 text-center transition-colors",
				isDragging && "border-primary bg-primary/5",
				!isDragging &&
					"border-muted-foreground/25 hover:border-muted-foreground/40",
				disabled && "pointer-events-none opacity-50",
			)}
			onDragLeave={() => setIsDragging(false)}
			onDragOver={(e) => {
				e.preventDefault();
				setIsDragging(true);
			}}
			onDrop={handleDrop}
		>
			{/* Diagonal stripes background */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 opacity-[0.04]"
				style={{
					backgroundImage:
						"repeating-linear-gradient(-45deg, currentColor, currentColor 1px, transparent 1px, transparent 8px)",
				}}
			/>

			<div className="relative flex flex-col items-center gap-3">
				<div className="flex size-12 items-center justify-center rounded-xl bg-muted">
					<HugeiconsIcon
						className="size-6 text-muted-foreground"
						icon={CloudUploadIcon}
						strokeWidth={1.5}
					/>
				</div>

				<div className="space-y-1">
					<p className="font-semibold text-sm">
						Drag and drop PDF files to upload
					</p>
					<p className="text-muted-foreground text-xs">
						or,{" "}
						<button
							className="underline underline-offset-2"
							disabled={disabled}
							onClick={() => inputRef.current?.click()}
							type="button"
						>
							click to browse
						</button>{" "}
						(500 MB max)
					</p>
				</div>

				<Button
					disabled={disabled}
					onClick={() => inputRef.current?.click()}
					size="sm"
					type="button"
					variant="outline"
				>
					Select files
				</Button>
			</div>

			<input
				accept="application/pdf"
				className="hidden"
				multiple
				onChange={handleChange}
				ref={inputRef}
				type="file"
			/>
		</div>
	);
}
