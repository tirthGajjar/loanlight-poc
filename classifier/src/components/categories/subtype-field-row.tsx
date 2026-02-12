"use client";

import {
	ArrowDown01Icon,
	ArrowUp01Icon,
	Delete02Icon,
	Folder01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import type { EditorFormValues, SubtypeFieldValues } from "./types";

interface Props {
	errors?: FieldErrors<SubtypeFieldValues>;
	index: number;
	isFirst: boolean;
	isLast: boolean;
	onMoveDown: () => void;
	onMoveUp: () => void;
	register: UseFormRegister<EditorFormValues>;
	remove: (index: number) => void;
}

export function SubtypeFieldRow({
	errors,
	index,
	isFirst,
	isLast,
	onMoveDown,
	onMoveUp,
	register,
	remove,
}: Props) {
	const pre = `subtypes.${index}` as const;

	return (
		<div className="space-y-2 rounded-lg border bg-muted/30 p-3">
			<div className="flex items-center gap-2">
				<Input
					className="flex-1 font-mono"
					data-invalid={!!errors?.type}
					placeholder="e.g. w2"
					{...register(`${pre}.type`)}
				/>
				<InputGroup className="flex-1">
					<InputGroupAddon>
						<HugeiconsIcon
							className="size-3.5"
							icon={Folder01Icon}
							strokeWidth={2}
						/>
					</InputGroupAddon>
					<InputGroupInput
						data-invalid={!!errors?.encompassFolder}
						placeholder="e.g. Income: W-2's"
						{...register(`${pre}.encompassFolder`)}
					/>
				</InputGroup>
				<div className="flex shrink-0 gap-0.5">
					<Button
						disabled={isFirst}
						onClick={onMoveUp}
						size="icon-sm"
						type="button"
						variant="ghost"
					>
						<HugeiconsIcon
							className="text-muted-foreground"
							icon={ArrowUp01Icon}
							strokeWidth={2}
						/>
					</Button>
					<Button
						disabled={isLast}
						onClick={onMoveDown}
						size="icon-sm"
						type="button"
						variant="ghost"
					>
						<HugeiconsIcon
							className="text-muted-foreground"
							icon={ArrowDown01Icon}
							strokeWidth={2}
						/>
					</Button>
					<Button
						onClick={() => remove(index)}
						size="icon-sm"
						type="button"
						variant="ghost"
					>
						<HugeiconsIcon
							className="text-muted-foreground"
							icon={Delete02Icon}
							strokeWidth={2}
						/>
					</Button>
				</div>
			</div>

			{(errors?.type || errors?.encompassFolder) && (
				<div className="flex gap-2">
					<div className="flex-1">
						{errors?.type && <FieldError>{errors.type.message}</FieldError>}
					</div>
					<div className="flex-1">
						{errors?.encompassFolder && (
							<FieldError>{errors.encompassFolder.message}</FieldError>
						)}
					</div>
				</div>
			)}

			<Textarea
				data-invalid={!!errors?.description}
				placeholder="AI prompt description..."
				rows={2}
				{...register(`${pre}.description`)}
			/>
			{errors?.description && (
				<FieldError>{errors.description.message}</FieldError>
			)}
		</div>
	);
}
