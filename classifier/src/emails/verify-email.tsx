import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout } from "./_components/layout";

interface VerifyEmailProps {
	verificationUrl: string;
}

export default function VerifyEmail({
	verificationUrl = "https://example.com/verify",
}: VerifyEmailProps) {
	return (
		<EmailLayout preview="Verify your email address — LoanLight">
			<Heading style={heading}>Verify your email address</Heading>
			<Text style={paragraph}>
				Thanks for signing up for LoanLight. Please verify your email address to
				activate your account.
			</Text>
			<Section style={buttonSection}>
				<Button href={verificationUrl} style={button}>
					Verify email address
				</Button>
			</Section>
			<Text style={muted}>
				If you didn&apos;t create an account, you can safely ignore this email.
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
