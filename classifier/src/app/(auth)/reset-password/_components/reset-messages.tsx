import { AlertCircleIcon, CheckCircleIcon } from "../../_components/auth-icons";
import { AuthMessage } from "../../_components/auth-message";

export function ResetSuccessMessage() {
	return (
		<AuthMessage
			action={{ label: "Sign in", href: "/sign-in" }}
			description="Your password has been reset. You can now sign in with your new password."
			icon={<CheckCircleIcon className="size-6 text-muted-foreground" />}
			title="Password updated"
		/>
	);
}

export function InvalidTokenMessage() {
	return (
		<AuthMessage
			action={{
				label: "Request new link",
				href: "/forgot-password",
				variant: "outline",
			}}
			description="This password reset link is invalid or has expired."
			icon={<AlertCircleIcon className="size-6 text-destructive" />}
			iconClassName="bg-destructive/10"
			title="Invalid reset link"
		/>
	);
}
