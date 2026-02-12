import {
	Body,
	Container,
	Head,
	Hr,
	Html,
	Preview,
	Section,
	Text,
} from "@react-email/components";

interface EmailLayoutProps {
	preview: string;
	children: React.ReactNode;
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
	return (
		<Html dir="ltr" lang="en">
			<Head />
			<Preview>{preview}</Preview>
			<Body style={body}>
				<Container style={container}>
					<Section style={brandSection}>
						<Text style={logo}>LoanLight</Text>
						<Hr style={divider} />
					</Section>
					<Section style={content}>{children}</Section>
					<Section style={footerSection}>
						<Hr style={divider} />
						<Text style={footer}>
							LoanLight Inc. &middot; Secure document classification for
							mortgage professionals.
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}

const body = {
	backgroundColor: "#f6f9fc",
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
	margin: "0",
	padding: "0",
};

const container = {
	backgroundColor: "#ffffff",
	margin: "40px auto 48px",
	maxWidth: "520px",
};

const brandSection = {
	padding: "40px 48px 0",
};

const logo = {
	color: "#18181b",
	fontSize: "17px",
	fontWeight: "700" as const,
	letterSpacing: "-0.5px",
	margin: "0 0 28px",
};

const divider = {
	borderColor: "#e6ebf1",
	margin: "0",
};

const content = {
	padding: "32px 48px 36px",
};

const footerSection = {
	padding: "0 48px 32px",
};

const footer = {
	color: "#8898aa",
	fontSize: "12px",
	lineHeight: "16px",
	margin: "20px 0 0",
};
