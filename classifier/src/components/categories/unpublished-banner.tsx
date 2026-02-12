"use client";

import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

export function UnpublishedBanner() {
	const utils = api.useUtils();
	const [confirmAction, setConfirmAction] = useState<
		"discard" | "publish" | null
	>(null);

	const discard = api.categories.discardDraft.useMutation({
		onSuccess: () => {
			utils.categories.getWorkingVersion.invalidate();
			setConfirmAction(null);
		},
	});

	const publish = api.categories.publishVersion.useMutation({
		onSuccess: () => {
			utils.categories.getWorkingVersion.invalidate();
			setConfirmAction(null);
		},
	});

	const isPending = discard.isPending || publish.isPending;

	return (
		<>
			<div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950">
				<div className="flex items-center gap-2">
					<span className="h-2 w-2 rounded-full bg-amber-500" />
					<span className="text-sm">You have unpublished changes.</span>
				</div>
				<div className="flex items-center gap-2">
					<Button
						onClick={() => setConfirmAction("discard")}
						size="sm"
						variant="outline"
					>
						Discard
					</Button>
					<Button onClick={() => setConfirmAction("publish")} size="sm">
						Publish
					</Button>
				</div>
			</div>

			<AlertDialog
				onOpenChange={(open) => {
					if (!open) setConfirmAction(null);
				}}
				open={confirmAction === "discard"}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Discard draft?</AlertDialogTitle>
						<AlertDialogDescription>
							This will delete all unpublished changes and revert to the last
							published version. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							disabled={isPending}
							onClick={() => discard.mutate()}
						>
							{discard.isPending ? "Discarding..." : "Discard"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog
				onOpenChange={(open) => {
					if (!open) setConfirmAction(null);
				}}
				open={confirmAction === "publish"}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Publish this version?</AlertDialogTitle>
						<AlertDialogDescription>
							Publishing will make this the active version. The current published
							version will be archived. New classification jobs will use this
							version.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							disabled={isPending}
							onClick={() => publish.mutate()}
						>
							{publish.isPending ? "Publishing..." : "Publish"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
