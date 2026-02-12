import { MailIcon } from "../../_components/auth-icons";
import { AuthMessage } from "../../_components/auth-message";

export function SubmittedMessage({ email }: { email: string }) {
	return (
		<AuthMessage
			action={{
				label: "Back to sign in",
				href: "/sign-in",
				variant: "outline",
			}}
			description={
				<>
					We sent a verification link to{" "}
					<span className="font-medium text-foreground">{email}</span>. Check
					your email to verify your account.
				</>
			}
			icon={<MailIcon className="size-6 text-muted-foreground" />}
			title="Check your email"
		/>
	);
}
