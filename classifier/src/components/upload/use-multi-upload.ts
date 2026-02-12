"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { JobStatus } from "@/components/jobs/job-phases";
import { TERMINAL_STATUSES } from "@/components/jobs/job-phases";
import { api } from "@/trpc/react";
import { MAX_FILE_SIZE, uploadToS3 } from "./use-s3-upload";

export type UploadItemStatus =
	| "queued"
	| "uploading"
	| "creating-job"
	| "processing"
	| "completed"
	| "failed";

export interface UploadItem {
	id: string;
	file: File;
	status: UploadItemStatus;
	uploadProgress: number;
	jobId: string | null;
	jobStatus: JobStatus | null;
	error: string | null;
}

export function useMultiUpload(loanId: string) {
	const [items, setItems] = useState<UploadItem[]>([]);
	const itemsRef = useRef(items);
	itemsRef.current = items;

	const activeXhrRef = useRef<XMLHttpRequest | null>(null);
	const processingRef = useRef(false);

	const presign = api.upload.presign.useMutation();
	const createJob = api.jobs.create.useMutation();

	const updateItem = useCallback((id: string, patch: Partial<UploadItem>) => {
		setItems((prev) =>
			prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
		);
	}, []);

	const processItem = useCallback(
		async (item: UploadItem) => {
			processingRef.current = true;
			const { id, file } = item;

			try {
				updateItem(id, { status: "uploading", uploadProgress: 0 });

				const { presignedUrl, s3Key } = await presign.mutateAsync({
					contentType: file.type,
					fileSizeBytes: file.size,
					filename: file.name,
					loanId,
				});

				const xhrRef = {
					current: null,
				} as React.RefObject<XMLHttpRequest | null>;
				activeXhrRef.current = null;

				await uploadToS3(presignedUrl, file, xhrRef, (progress) => {
					activeXhrRef.current = xhrRef.current;
					updateItem(id, { uploadProgress: progress });
				});

				activeXhrRef.current = null;
				updateItem(id, { status: "creating-job" });

				const result = await createJob.mutateAsync({
					fileName: file.name,
					fileSizeBytes: file.size,
					loanId,
					s3Key,
				});

				updateItem(id, {
					jobId: result.jobId,
					status: "processing",
				});
			} catch (err) {
				const message = err instanceof Error ? err.message : "Upload failed";
				updateItem(id, { error: message, status: "failed" });
			} finally {
				processingRef.current = false;
				activeXhrRef.current = null;
			}
		},
		[loanId, presign, createJob, updateItem],
	);

	// Queue processor: pick next queued item when nothing is active
	useEffect(() => {
		if (processingRef.current) return;
		const next = items.find((i) => i.status === "queued");
		if (next) {
			processItem(next);
		}
	}, [items, processItem]);

	const addFiles = useCallback((files: File[]) => {
		const newItems: UploadItem[] = files.map((file) => {
			const id = crypto.randomUUID();

			if (file.type !== "application/pdf") {
				return {
					id,
					file,
					status: "failed" as const,
					uploadProgress: 0,
					jobId: null,
					jobStatus: null,
					error: "Only PDF files are allowed",
				};
			}

			if (file.size > MAX_FILE_SIZE) {
				return {
					id,
					file,
					status: "failed" as const,
					uploadProgress: 0,
					jobId: null,
					jobStatus: null,
					error: "File size exceeds 500 MB limit",
				};
			}

			return {
				id,
				file,
				status: "queued" as const,
				uploadProgress: 0,
				jobId: null,
				jobStatus: null,
				error: null,
			};
		});

		setItems((prev) => [...prev, ...newItems]);
	}, []);

	const removeItem = useCallback((id: string) => {
		const item = itemsRef.current.find((i) => i.id === id);
		if (!item) return;

		if (item.status === "uploading") {
			activeXhrRef.current?.abort();
			activeXhrRef.current = null;
		}

		setItems((prev) => prev.filter((i) => i.id !== id));
	}, []);

	const retryItem = useCallback((id: string) => {
		setItems((prev) =>
			prev.map((item) =>
				item.id === id
					? {
							...item,
							status: "queued" as const,
							error: null,
							uploadProgress: 0,
						}
					: item,
			),
		);
	}, []);

	const updateJobStatus = useCallback(
		(itemId: string, jobStatus: JobStatus) => {
			if (TERMINAL_STATUSES.has(jobStatus)) {
				const finalStatus = jobStatus === "COMPLETED" ? "completed" : "failed";
				const error =
					finalStatus === "failed" ? `Job ${jobStatus.toLowerCase()}` : null;
				updateItem(itemId, {
					jobStatus,
					status: finalStatus,
					error,
				});
			} else {
				updateItem(itemId, { jobStatus });
			}
		},
		[updateItem],
	);

	// Abort active XHR on unmount
	useEffect(() => {
		return () => {
			activeXhrRef.current?.abort();
		};
	}, []);

	// Batch poll: single query for all processing items instead of per-row polling
	const processingJobIds = items
		.filter(
			(i): i is UploadItem & { jobId: string } =>
				i.status === "processing" && i.jobId != null,
		)
		.map((i) => i.jobId);

	const { data: batchStatuses } = api.jobs.getStatusBatch.useQuery(
		{ jobIds: processingJobIds },
		{
			enabled: processingJobIds.length > 0,
			refetchInterval: 3000,
		},
	);

	useEffect(() => {
		if (!batchStatuses) return;
		for (const item of itemsRef.current) {
			if (item.status !== "processing" || !item.jobId) continue;
			const newStatus = batchStatuses[item.jobId] as JobStatus | undefined;
			if (newStatus && newStatus !== item.jobStatus) {
				updateJobStatus(item.id, newStatus);
			}
		}
	}, [batchStatuses, updateJobStatus]);

	const clearCompleted = useCallback(() => {
		setItems((prev) =>
			prev.filter((i) => i.status !== "completed" && i.status !== "failed"),
		);
	}, []);

	const activeCount = items.filter(
		(i) =>
			i.status === "queued" ||
			i.status === "uploading" ||
			i.status === "creating-job" ||
			i.status === "processing",
	).length;

	return {
		items,
		addFiles,
		removeItem,
		retryItem,
		clearCompleted,
		activeCount,
		hasActive: activeCount > 0,
	};
}
