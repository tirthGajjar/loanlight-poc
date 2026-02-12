"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/server/better-auth/client";
import { AuthHeader } from "../_components/auth-header";
import { MailIcon } from "../_components/auth-icons";
import { AuthMessage } from "../_components/auth-message";
import { FormError } from "../_components/form-error";

const schema = z.object({
	email: z.string().email("Please enter a valid email address"),
});

export default function ForgotPasswordPage() {
	const emailId = useId();
	const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

	if (submittedEmail) {
		return (
			<AuthMessage
				action={{
					label: "Back to sign in",
					href: "/sign-in",
					variant: "outline",
				}}
				description={
					<>
						If an account exists for{" "}
						<span className="font-medium text-foreground">
							{submittedEmail}
						</span>
						, you'll receive a password reset link shortly.
					</>
				}
				icon={<MailIcon className="size-6 text-muted-foreground" />}
				title="Check your email"
			/>
		);
	}

	async function onSubmit(values: z.infer<typeof schema>) {
		const { error } = await authClient.requestPasswordReset({
			email: values.email,
			redirectTo: "/reset-password",
		});
		if (error) {
			setError("root", {
				message: error.message ?? "Failed to send reset email",
			});
			return;
		}
		setSubmittedEmail(values.email);
	}

	return (
		<div>
			<AuthHeader
				description="Enter your email and we'll send you a link to reset your password."
				title="Reset your password"
			/>
			<form onSubmit={handleSubmit(onSubmit)}>
				<FieldGroup>
					<FormError message={errors.root?.message} />
					<Field data-invalid={!!errors.email}>
						<FieldLabel htmlFor={emailId}>Email</FieldLabel>
						<Input
							aria-invalid={!!errors.email}
							autoComplete="email"
							autoFocus
							id={emailId}
							placeholder="you@example.com"
							type="email"
							{...register("email")}
						/>
						{errors.email && <FieldError>{errors.email.message}</FieldError>}
					</Field>
					<Button
						className="!mt-2 w-full"
						disabled={isSubmitting}
						size="lg"
						type="submit"
					>
						{isSubmitting ? "Sending link..." : "Send reset link"}
					</Button>
				</FieldGroup>
			</form>
			<p className="mt-8 text-center text-muted-foreground text-sm">
				Remember your password?{" "}
				<Link
					className="font-medium text-foreground transition-colors hover:text-foreground/80"
					href="/sign-in"
				>
					Sign in
				</Link>
			</p>
		</div>
	);
}
