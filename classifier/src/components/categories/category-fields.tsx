"use client";

import {
	Heading01Icon,
	LeftToRightBlockQuoteIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { EditorFormValues } from "./types";

interface Props {
	errors: FieldErrors<EditorFormValues>;
	register: UseFormRegister<EditorFormValues>;
}

export function CategoryFields({ errors, register }: Props) {
	return (
		<>
			<FieldLegend>Category Details</FieldLegend>
			<FieldGroup>
				<Field data-invalid={!!errors.name}>
					<FieldLabel>
						<HugeiconsIcon
							className="size-3.5 text-muted-foreground"
							icon={Heading01Icon}
							strokeWidth={2}
						/>
						Name
					</FieldLabel>
					<FieldDescription>
						Unique identifier for this document category
					</FieldDescription>
					<Input placeholder="e.g. Income" {...register("name")} />
					{errors.name && <FieldError>{errors.name.message}</FieldError>}
				</Field>

				<Field data-invalid={!!errors.description}>
					<FieldLabel>
						<HugeiconsIcon
							className="size-3.5 text-muted-foreground"
							icon={LeftToRightBlockQuoteIcon}
							strokeWidth={2}
						/>
						Description
					</FieldLabel>
					<FieldDescription>
						AI prompt text used to classify documents into this category. Be
						specific about what documents belong here.
					</FieldDescription>
					<Textarea
						placeholder="AI prompt description for this category..."
						rows={6}
						{...register("description")}
					/>
					{errors.description && (
						<FieldError>{errors.description.message}</FieldError>
					)}
				</Field>
			</FieldGroup>
		</>
	);
}
