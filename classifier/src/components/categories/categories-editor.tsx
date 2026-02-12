"use client";

import { Add01Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { CategoryCard } from "./category-card";
import { CategoryEditor } from "./category-editor";
import { DeleteDialog } from "./delete-dialog";
import { HistorySheet } from "./history-sheet";
import type { CategoryData } from "./types";
import { UnpublishedBanner } from "./unpublished-banner";

type DeleteTarget = { id: string; versionId: string };

export function CategoriesEditor() {
	const { data, isLoading } = api.categories.getWorkingVersion.useQuery();
	const utils = api.useUtils();

	const [editorData, setEditorData] = useState<{
		initial?: CategoryData;
		open: boolean;
	}>({ open: false });
	const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
	const [historyOpen, setHistoryOpen] = useState(false);

	const ensureDraft = api.categories.ensureDraft.useMutation();

	const deleteCat = api.categoryMutations.deleteCategory.useMutation({
		onSuccess: () => {
			utils.categories.getWorkingVersion.invalidate();
			setDeleteTarget(null);
		},
	});

	const swapSort = api.categoryMutations.swapCategorySortOrder.useMutation({
		onSuccess: () => utils.categories.getWorkingVersion.invalidate(),
	});

	if (isLoading) return <LoadingSkeleton />;

	const isDraft = data?.status === "DRAFT";
	const cats = data?.categories ?? [];

	/**
	 * If already a draft, returns current data. Otherwise creates a draft
	 * (copying from published) and fetches the fresh draft data so we have
	 * the new category IDs.
	 */
	async function getOrCreateDraft() {
		if (isDraft && data) return data;
		await ensureDraft.mutateAsync();
		return await utils.categories.getWorkingVersion.fetch();
	}

	async function handleAddCategory() {
		if (!isDraft) {
			await ensureDraft.mutateAsync();
			utils.categories.getWorkingVersion.invalidate();
		}
		setEditorData({ open: true });
	}

	async function handleEditCategory(cat: CategoryData) {
		if (isDraft) {
			setEditorData({ initial: cat, open: true });
			return;
		}
		// Create draft, fetch fresh data, find matching category by sortOrder
		const freshData = await getOrCreateDraft();
		const match = freshData?.categories.find(
			(c) => c.sortOrder === cat.sortOrder,
		);
		if (match) {
			setEditorData({ initial: match, open: true });
		}
	}

	async function handleDeleteCategory(cat: CategoryData) {
		if (isDraft && data) {
			setDeleteTarget({ id: cat.id, versionId: data.id });
			return;
		}
		const freshData = await getOrCreateDraft();
		const match = freshData?.categories.find(
			(c) => c.sortOrder === cat.sortOrder,
		);
		if (match && freshData) {
			setDeleteTarget({ id: match.id, versionId: freshData.id });
		}
	}

	async function handleSwap(indexA: number, indexB: number) {
		if (isDraft && data) {
			const a = cats[indexA];
			const b = cats[indexB];
			if (a && b) {
				swapSort.mutate({ idA: a.id, idB: b.id, versionId: data.id });
			}
			return;
		}
		const freshData = await getOrCreateDraft();
		const draftCats = freshData?.categories ?? [];
		const a = draftCats[indexA];
		const b = draftCats[indexB];
		if (a && b && freshData) {
			swapSort.mutate({ idA: a.id, idB: b.id, versionId: freshData.id });
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="font-semibold text-2xl tracking-tight">Categories</h1>
				<Button
					onClick={() => setHistoryOpen(true)}
					size="sm"
					variant="outline"
				>
					<HugeiconsIcon icon={Clock01Icon} strokeWidth={2} />
					History
				</Button>
			</div>

			{data?.hasDraft && <UnpublishedBanner />}

			<div className="flex items-center gap-2">
				<Button
					disabled={ensureDraft.isPending}
					onClick={handleAddCategory}
					variant="outline"
				>
					<HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
					{ensureDraft.isPending ? "Preparing..." : "Add Category"}
				</Button>
			</div>

			<Separator />

			{cats.length === 0 && <EmptyState />}

			<div className="space-y-4">
				{cats.map((cat, i) => (
					<CategoryCard
						description={cat.description}
						isDraft
						isFirst={i === 0}
						isLast={i === cats.length - 1}
						key={cat.id}
						name={cat.name}
						onDeleteCategory={() => handleDeleteCategory(cat)}
						onEditCategory={() => handleEditCategory(cat)}
						onMoveDown={() => handleSwap(i, i + 1)}
						onMoveUp={() => handleSwap(i - 1, i)}
						subtypes={cat.subtypes}
					/>
				))}
			</div>

			{editorData.open && (
				<CategoryEditor
					initial={editorData.initial}
					nextSortOrder={cats.length}
					onClose={() => setEditorData({ open: false })}
					open
				/>
			)}

			<DeleteDialog
				description="This will delete the category and all its subtypes. This action cannot be undone."
				isPending={deleteCat.isPending}
				onConfirm={() => {
					if (deleteTarget) {
						deleteCat.mutate({
							id: deleteTarget.id,
							versionId: deleteTarget.versionId,
						});
					}
				}}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
				open={!!deleteTarget}
				title="Delete category?"
			/>

			<HistorySheet onOpenChange={setHistoryOpen} open={historyOpen} />
		</div>
	);
}

function LoadingSkeleton() {
	return (
		<div className="space-y-4">
			<Skeleton className="h-8 w-64" />
			<Skeleton className="h-4 w-48" />
			<Skeleton className="h-32 w-full" />
		</div>
	);
}

function EmptyState() {
	return (
		<Card>
			<CardContent className="py-8 text-center text-muted-foreground text-sm">
				No categories yet. Add your first category to get started.
			</CardContent>
		</Card>
	);
}
