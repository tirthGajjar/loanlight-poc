"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import type { EditorFormValues, SubtypeData } from "./types";

interface Options {
	initialSubtypes: SubtypeData[];
	onSuccess: () => void;
}

export function useSaveCategory({ initialSubtypes, onSuccess }: Options) {
	const [isPending, setIsPending] = useState(false);

	const ensureDraft = api.categories.ensureDraft.useMutation();
	const upsertCat = api.categoryMutations.upsertCategory.useMutation();
	const upsertSub = api.categoryMutations.upsertSubtype.useMutation();
	const deleteSub = api.categoryMutations.deleteSubtype.useMutation();

	async function execute(values: EditorFormValues, categoryId?: string) {
		setIsPending(true);
		try {
			const draft = await ensureDraft.mutateAsync();
			const versionId = draft.id;

			const cat = await upsertCat.mutateAsync({
				...values,
				id: categoryId,
				versionId,
			});

			const catId = categoryId ?? cat.id;

			await Promise.all(
				values.subtypes.map((s, i) =>
					upsertSub.mutateAsync({
						...s,
						categoryId: catId,
						sortOrder: i,
					}),
				),
			);

			const removedIds = initialSubtypes
				.filter((s) => !values.subtypes.some((f) => f.id === s.id))
				.map((s) => s.id);

			await Promise.all(
				removedIds.map((id) =>
					deleteSub.mutateAsync({ categoryId: catId, id }),
				),
			);

			onSuccess();
		} finally {
			setIsPending(false);
		}
	}

	return { execute, isPending };
}
