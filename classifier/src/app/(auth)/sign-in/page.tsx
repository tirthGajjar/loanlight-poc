"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { authClient } from "@/server/better-auth/client";
import { AuthFooter } from "../_components/auth-footer";
import { AuthFormField } from "../_components/auth-form-field";
import { AuthHeader } from "../_components/auth-header";
import { FormError } from "../_components/form-error";

const schema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function SignInPage() {
	const router = useRouter();
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({ resolver: zodResolver(schema) });

	async function onSubmit(values: FormValues) {
		const { error } = await authClient.signIn.email({
			email: values.email,
			password: values.password,
			callbackURL: "/dashboard",
		});
		if (error) {
			setError("root", {
				message:
					error.code === "EMAIL_NOT_VERIFIED"
						? "Please verify your email before signing in. Check your inbox."
						: (error.message ?? "Invalid email or password"),
			});
			return;
		}
		router.push("/dashboard");
		router.refresh();
	}

	return (
		<div>
			<AuthHeader
				description="Sign in to your account to continue"
				title="Welcome back"
			/>
			<SignInForm
				errors={errors}
				isSubmitting={isSubmitting}
				onSubmit={handleSubmit(onSubmit)}
				register={register}
			/>
			<AuthFooter
				href="/sign-up"
				label="Don't have an account?"
				linkText="Create account"
			/>
		</div>
	);
}

function SignInForm({
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
					autoComplete="email"
					autoFocus
					error={errors.email}
					label="Email"
					placeholder="you@example.com"
					type="email"
					{...register("email")}
				/>
				<AuthFormField
					autoComplete="current-password"
					error={errors.password}
					label="Password"
					labelExtra={
						<Link
							className="text-muted-foreground text-xs transition-colors hover:text-foreground"
							href="/forgot-password"
						>
							Forgot password?
						</Link>
					}
					placeholder="Enter your password"
					type="password"
					{...register("password")}
				/>
				<Button
					className="!mt-2 w-full"
					disabled={isSubmitting}
					size="lg"
					type="submit"
				>
					{isSubmitting ? "Signing in..." : "Sign in"}
				</Button>
			</FieldGroup>
		</form>
	);
}
