"use client";

import { useId } from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface AuthFormFieldProps extends React.ComponentProps<typeof Input> {
	error?: { message?: string };
	label: string;
	labelExtra?: React.ReactNode;
}

export function AuthFormField({
	error,
	label,
	labelExtra,
	...inputProps
}: AuthFormFieldProps) {
	const id = useId();
	return (
		<Field data-invalid={!!error}>
			{labelExtra ? (
				<div className="flex items-center justify-between">
					<FieldLabel htmlFor={id}>{label}</FieldLabel>
					{labelExtra}
				</div>
			) : (
				<FieldLabel htmlFor={id}>{label}</FieldLabel>
			)}
			<Input aria-invalid={!!error} id={id} {...inputProps} />
			{error && <FieldError>{error.message}</FieldError>}
		</Field>
	);
}
