"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { FieldLegend } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { api } from "@/trpc/react";
import { CategoryFields } from "./category-fields";
import { EditorFooter } from "./editor-footer";
import { editorSchema } from "./editor-schema";
import { EditorSubtypes } from "./editor-subtypes";
import type { CategoryData, EditorFormValues } from "./types";
import { useSaveCategory } from "./use-save-category";

interface Props {
	initial?: CategoryData;
	nextSortOrder?: number;
	onClose: () => void;
	open: boolean;
}

export function CategoryEditor({
	initial,
	nextSortOrder = 0,
	onClose,
	open,
}: Props) {
	const utils = api.useUtils();
	const form = useForm<EditorFormValues>({
		defaultValues: {
			description: initial?.description ?? "",
			name: initial?.name ?? "",
			sortOrder: initial?.sortOrder ?? nextSortOrder,
			subtypes: initial?.subtypes.map((s) => ({ ...s })) ?? [],
		},
		mode: "onChange",
		resolver: zodResolver(editorSchema),
	});

	const { append, fields, remove, swap } = useFieldArray({
		control: form.control,
		name: "subtypes",
	});

	const save = useSaveCategory({
		initialSubtypes: initial?.subtypes ?? [],
		onSuccess: () => {
			utils.categories.getWorkingVersion.invalidate();
			onClose();
		},
	});

	const onSubmit = form.handleSubmit((v) => save.execute(v, initial?.id));
	const addSubtype = () =>
		append({ description: "", encompassFolder: "", sortOrder: 0, type: "" });

	return (
		<Sheet onOpenChange={(v) => !v && onClose()} open={open}>
			<SheetContent className="sm:min-w-[40%]" side="right">
				<SheetHeader>
					<SheetTitle>{initial ? "Edit Category" : "Add Category"}</SheetTitle>
					<SheetDescription>
						{initial
							? "Update category and its subtypes"
							: "Define a new category with subtypes"}
					</SheetDescription>
				</SheetHeader>
				<form
					className="flex flex-1 flex-col gap-6 overflow-y-auto px-6"
					onSubmit={onSubmit}
				>
					<CategoryFields
						errors={form.formState.errors}
						register={form.register}
					/>
					<Separator />
					<FieldLegend>Subtypes</FieldLegend>
					<EditorSubtypes
						errors={form.formState.errors.subtypes}
						fields={fields}
						register={form.register}
						remove={remove}
						swap={swap}
					/>
				</form>
				<EditorFooter
					isPending={save.isPending}
					isValid={form.formState.isValid}
					onAddSubtype={addSubtype}
					onClose={onClose}
					onSave={onSubmit}
				/>
			</SheetContent>
		</Sheet>
	);
}
