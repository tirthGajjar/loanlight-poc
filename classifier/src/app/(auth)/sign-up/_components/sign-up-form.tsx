"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { authClient } from "@/server/better-auth/client";
import { AuthFooter } from "../../_components/auth-footer";
import { AuthFormField } from "../../_components/auth-form-field";
import { AuthHeader } from "../../_components/auth-header";
import { FormError } from "../../_components/form-error";
import { SubmittedMessage } from "./submitted-message";

const schema = z
	.object({
		name: z.string().min(1, "Name is required"),
		email: z.string().email("Please enter a valid email address"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((d) => d.password === d.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type FormValues = z.infer<typeof schema>;

export function SignUpForm() {
	const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({ resolver: zodResolver(schema) });

	async function onSubmit(values: FormValues) {
		const { error } = await authClient.signUp.email({
			name: values.name,
			email: values.email,
			password: values.password,
		});
		if (error) {
			setError("root", {
				message: error.message ?? "Failed to create account",
			});
			return;
		}
		setSubmittedEmail(values.email);
	}

	if (submittedEmail) return <SubmittedMessage email={submittedEmail} />;

	return (
		<div>
			<AuthHeader
				description="Get started with document classification"
				title="Create your account"
			/>
			<SignUpFields
				errors={errors}
				isSubmitting={isSubmitting}
				onSubmit={handleSubmit(onSubmit)}
				register={register}
			/>
			<AuthFooter
				href="/sign-in"
				label="Already have an account?"
				linkText="Sign in"
			/>
		</div>
	);
}

function SignUpFields({
	errors,
	isSubmitting,
	onSubmit,
	register,
}: {
	errors: ReturnType<typeof useForm<FormValues>>["formState"]["errors"];
	isSubmitting: boolean;
	onSubmit: React.FormEventHandler<HTMLFormElement>;
	register: ReturnType<typeof useForm<FormValues>>["register"];
}) {
	return (
		<form onSubmit={onSubmit}>
			<FieldGroup>
				<FormError message={errors.root?.message} />
				<AuthFormField
					autoComplete="name"
					autoFocus
					error={errors.name}
					label="Full name"
					placeholder="Jane Doe"
					type="text"
					{...register("name")}
				/>
				<AuthFormField
					autoComplete="email"
					error={errors.email}
					label="Email"
					placeholder="you@example.com"
					type="email"
					{...register("email")}
				/>
				<AuthFormField
					autoComplete="new-password"
					error={errors.password}
					label="Password"
					placeholder="At least 8 characters"
					type="password"
					{...register("password")}
				/>
				<AuthFormField
					autoComplete="new-password"
					error={errors.confirmPassword}
					label="Confirm password"
					placeholder="Confirm your password"
					type="password"
					{...register("confirmPassword")}
				/>
				<Button
					className="!mt-2 w-full"
					disabled={isSubmitting}
					size="lg"
					type="submit"
				>
					{isSubmitting ? "Creating account..." : "Create account"}
				</Button>
			</FieldGroup>
		</form>
	);
}
