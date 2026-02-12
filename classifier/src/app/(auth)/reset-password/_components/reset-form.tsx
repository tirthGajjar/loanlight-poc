"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { authClient } from "@/server/better-auth/client";
import { AuthFormField } from "../../_components/auth-form-field";
import { AuthHeader } from "../../_components/auth-header";
import { FormError } from "../../_components/form-error";
import { InvalidTokenMessage, ResetSuccessMessage } from "./reset-messages";

const schema = z
	.object({
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((d) => d.password === d.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export function ResetForm() {
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const errorParam = searchParams.get("error");
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting, isSubmitSuccessful },
	} = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

	async function onSubmit(values: z.infer<typeof schema>) {
		if (!token) {
			setError("root", { message: "No reset token provided" });
			return;
		}
		const { error } = await authClient.resetPassword({
			newPassword: values.password,
			token,
		});
		if (error) {
			setError("root", {
				message: error.message ?? "Failed to reset password",
			});
		}
	}

	if (isSubmitSuccessful && !errors.root) return <ResetSuccessMessage />;
	if (!token || errorParam === "INVALID_TOKEN") return <InvalidTokenMessage />;

	return (
		<div>
			<AuthHeader
				description="Choose a strong password for your account."
				title="Set a new password"
			/>
			<form onSubmit={handleSubmit(onSubmit)}>
				<FieldGroup>
					<FormError message={errors.root?.message} />
					<AuthFormField
						autoComplete="new-password"
						autoFocus
						error={errors.password}
						label="New password"
						placeholder="At least 8 characters"
						type="password"
						{...register("password")}
					/>
					<AuthFormField
						autoComplete="new-password"
						error={errors.confirmPassword}
						label="Confirm password"
						placeholder="Confirm your new password"
						type="password"
						{...register("confirmPassword")}
					/>
					<Button
						className="!mt-2 w-full"
						disabled={isSubmitting}
						size="lg"
						type="submit"
					>
						{isSubmitting ? "Resetting..." : "Reset password"}
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
