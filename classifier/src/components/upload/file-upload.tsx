"use client";

import { DropZone } from "./drop-zone";
import { FileItemRow } from "./file-item-row";
import type { UploadItem } from "./use-multi-upload";

interface FileUploadProps {
	items: UploadItem[];
	addFiles: (files: File[]) => void;
	removeItem: (id: string) => void;
	retryItem: (id: string) => void;
}

export function FileUpload({
	items,
	addFiles,
	removeItem,
	retryItem,
}: FileUploadProps) {
	return (
		<div className="space-y-3">
			<DropZone onFilesSelect={addFiles} />
			{items.length > 0 && (
				<div className="max-h-80 space-y-2 overflow-y-auto">
					{items.map((item) => (
						<FileItemRow
							item={item}
							key={item.id}
							onRemove={removeItem}
							onRetry={retryItem}
						/>
					))}
				</div>
			)}
		</div>
	);
}
