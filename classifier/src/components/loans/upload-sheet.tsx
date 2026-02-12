"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useId } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";

const schema = z.object({
	borrowerName: z.string().optional(),
	loanNumber: z.string().min(1, "Loan number is required"),
	propertyAddress: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface NewLoanDialogProps {
	onOpenChange: (open: boolean) => void;
	open: boolean;
}

export function NewLoanDialog({ onOpenChange, open }: NewLoanDialogProps) {
	const router = useRouter();
	const create = api.loans.create.useMutation();

	const {
		formState: { errors, isValid },
		handleSubmit,
		register,
		reset,
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		mode: "onChange",
	});

	function handleClose() {
		reset();
		onOpenChange(false);
	}

	async function onSubmit(values: FormValues) {
		const loan = await create.mutateAsync({
			borrowerName: values.borrowerName || undefined,
			loanNumber: values.loanNumber.trim(),
			propertyAddress: values.propertyAddress || undefined,
		});
		handleClose();
		router.push(`/loans/${loan.id}`);
	}

	return (
		<Dialog onOpenChange={handleClose} open={open}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>New Loan</DialogTitle>
					<DialogDescription>
						Create a loan to start uploading documents
					</DialogDescription>
				</DialogHeader>
				<form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
					<FieldGroup>
						<FormField
							error={errors.loanNumber?.message}
							label="Loan Number"
							placeholder="e.g. LN-2026-00123"
							registration={register("loanNumber")}
						/>
						<FormField
							label="Borrower Name"
							placeholder="e.g. John Smith"
							registration={register("borrowerName")}
						/>
						<FormField
							label="Property Address"
							placeholder="e.g. 123 Main St, Springfield"
							registration={register("propertyAddress")}
						/>
					</FieldGroup>
					<Button disabled={!isValid || create.isPending} type="submit">
						{create.isPending ? "Creating..." : "Create Loan"}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function FormField({
	error,
	label,
	placeholder,
	registration,
}: {
	error?: string;
	label: string;
	placeholder: string;
	registration: ReturnType<ReturnType<typeof useForm>["register"]>;
}) {
	const id = useId();
	return (
		<Field data-invalid={!!error}>
			<FieldLabel htmlFor={id}>{label}</FieldLabel>
			<Input id={id} placeholder={placeholder} {...registration} />
			{error && <FieldError>{error}</FieldError>}
		</Field>
	);
}
