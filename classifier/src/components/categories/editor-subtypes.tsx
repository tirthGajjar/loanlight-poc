"use client";

import type {
	FieldErrors,
	UseFieldArrayRemove,
	UseFieldArraySwap,
	UseFormRegister,
} from "react-hook-form";
import { SubtypeFieldRow } from "./subtype-field-row";
import type { EditorFormValues } from "./types";

interface Props {
	errors?: FieldErrors<EditorFormValues>["subtypes"];
	fields: { id: string }[];
	register: UseFormRegister<EditorFormValues>;
	remove: UseFieldArrayRemove;
	swap: UseFieldArraySwap;
}

export function EditorSubtypes({
	errors,
	fields,
	register,
	remove,
	swap,
}: Props) {
	if (fields.length === 0) {
		return (
			<p className="text-muted-foreground text-sm">
				No subtypes yet. Use the button below to add one.
			</p>
		);
	}

	const last = fields.length - 1;

	return (
		<div className="space-y-3">
			{fields.map((field, index) => (
				<SubtypeFieldRow
					errors={errors?.[index]}
					index={index}
					isFirst={index === 0}
					isLast={index === last}
					key={field.id}
					onMoveDown={() => swap(index, index + 1)}
					onMoveUp={() => swap(index, index - 1)}
					register={register}
					remove={remove}
				/>
			))}
		</div>
	);
}
