"use client";

import { CloudUploadIcon, FolderOpenIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { UploadsTable } from "@/components/loans/uploads-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { FileUpload } from "@/components/upload/file-upload";
import { useMultiUpload } from "@/components/upload/use-multi-upload";
import { api } from "@/trpc/react";

// Upload state is lifted here (not inside the dialog) because Base UI Dialog
// unmounts portal content when closed, which would abort active XHR uploads.
export function LoanDetail({ loanId }: { loanId: string }) {
	const [uploadOpen, setUploadOpen] = useState(false);
	const utils = api.useUtils();
	const upload = useMultiUpload(loanId);
	const { data: loan } = api.loans.get.useQuery(
		{ id: loanId },
		{ refetchInterval: upload.hasActive ? 10_000 : false },
	);

	// Auto-refresh jobs table when a new upload completes (tracked by ID, not count)
	const prevCompletedIdsRef = useRef(new Set<string>());
	useEffect(() => {
		const completedIds = new Set(
			upload.items.filter((i) => i.status === "completed").map((i) => i.id),
		);
		const hasNew = [...completedIds].some(
			(id) => !prevCompletedIdsRef.current.has(id),
		);
		if (hasNew) {
			utils.loans.get.invalidate({ id: loanId });
		}
		prevCompletedIdsRef.current = completedIds;
	}, [upload.items, loanId]);

	if (!loan) return null;

	return (
		<div className="space-y-6">
			<div className="flex items-start justify-between">
				<div className="space-y-1">
					<h1 className="font-semibold text-2xl tracking-tight">
						{loan.loanNumber}
					</h1>
					<LoanMeta loan={loan} />
				</div>
				<div className="flex items-center gap-2">
					<Button
						render={<Link href={`/loans/${loanId}/documents`} />}
						variant="outline"
					>
						<HugeiconsIcon icon={FolderOpenIcon} strokeWidth={2} />
						View Documents
					</Button>
					<Button onClick={() => setUploadOpen(true)}>
						<HugeiconsIcon icon={CloudUploadIcon} strokeWidth={2} />
						Upload Documents
						{upload.activeCount > 0 && (
							<Badge className="ml-1" variant="secondary">
								{upload.activeCount}
							</Badge>
						)}
					</Button>
				</div>
			</div>
			<UploadsTable jobs={loan.classificationJobs} />
			<UploadModal
				hasActive={upload.hasActive}
				onOpenChange={setUploadOpen}
				open={uploadOpen}
			>
				<FileUpload
					addFiles={upload.addFiles}
					items={upload.items}
					removeItem={upload.removeItem}
					retryItem={upload.retryItem}
				/>
			</UploadModal>
		</div>
	);
}

function LoanMeta({
	loan,
}: {
	loan: {
		borrowerName: string | null;
		createdAt: Date;
		propertyAddress: string | null;
	};
}) {
	return (
		<div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-sm">
			{loan.borrowerName && <span>{loan.borrowerName}</span>}
			{loan.propertyAddress && <span>{loan.propertyAddress}</span>}
			<span>{loan.createdAt.toLocaleDateString()}</span>
		</div>
	);
}

function UploadModal({
	children,
	hasActive,
	onOpenChange,
	open,
}: {
	children: ReactNode;
	hasActive: boolean;
	onOpenChange: (open: boolean) => void;
	open: boolean;
}) {
	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className="sm:max-w-2xl" showCloseButton={false}>
				<DialogHeader>
					<DialogTitle>Upload Documents</DialogTitle>
					<DialogDescription>
						Drop one or more PDFs for classification
					</DialogDescription>
				</DialogHeader>
				{children}
				<DialogFooter className="border-border border-t pt-4">
					<DialogClose render={<Button variant="outline" />}>
						{hasActive ? "Minimize" : "Done"}
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
