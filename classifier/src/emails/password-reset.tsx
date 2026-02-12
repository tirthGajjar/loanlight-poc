import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout } from "./_components/layout";

interface PasswordResetEmailProps {
	resetUrl: string;
	userEmail: string;
}

export default function PasswordResetEmail({
	resetUrl = "https://example.com/reset",
	userEmail = "user@example.com",
}: PasswordResetEmailProps) {
	return (
		<EmailLayout preview="Reset your LoanLight password">
			<Heading style={heading}>Reset your password</Heading>
			<Text style={paragraph}>
				We received a request to reset the password for{" "}
				<strong>{userEmail}</strong>. Use the button below to set a new one.
			</Text>
			<Section style={buttonSection}>
				<Button href={resetUrl} style={button}>
					Reset password
				</Button>
			</Section>
			<Text style={muted}>
				This link expires in 1 hour. If you didn&apos;t request a password
				reset, you can safely ignore this email.
			</Text>
		</EmailLayout>
	);
}

const heading = {
	color: "#32325d",
	fontSize: "24px",
	fontWeight: "500" as const,
	letterSpacing: "-0.4px",
	lineHeight: "32px",
	margin: "0 0 12px",
};

const paragraph = {
	color: "#525f7f",
	fontSize: "16px",
	lineHeight: "26px",
	margin: "0 0 28px",
};

const buttonSection = {
	margin: "0 0 28px",
	textAlign: "center" as const,
};

const button = {
	backgroundColor: "#18181b",
	borderRadius: "5px",
	color: "#ffffff",
	fontSize: "15px",
	fontWeight: "600" as const,
	padding: "12px 48px",
	textDecoration: "none",
};

const muted = {
	color: "#8c98a4",
	fontSize: "14px",
	lineHeight: "22px",
	margin: "0",
};
