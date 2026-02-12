import type React from "react";
import { env } from "@/env";

interface SendEmailOptions {
	to: string;
	subject: string;
	react: React.ReactElement;
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
	if (env.NODE_ENV === "production") {
		await sendWithResend({ to, subject, react });
	} else {
		await sendWithMailpit({ to, subject, react });
	}
}

async function sendWithResend({ to, subject, react }: SendEmailOptions) {
	const { Resend } = await import("resend");
	const resend = new Resend(env.RESEND_API_KEY);

	const { error } = await resend.emails.send({
		from: env.EMAIL_FROM,
		react,
		subject,
		to,
	});

	if (error) {
		throw new Error(`Failed to send email: ${error.message}`);
	}
}

async function sendWithMailpit({ to, subject, react }: SendEmailOptions) {
	const { render } = await import("@react-email/render");
	const nodemailer = await import("nodemailer");

	const html = await render(react);
	const transporter = nodemailer.createTransport({
		host: env.LOCAL_ONLY_SMTP_HOST,
		port: env.LOCAL_ONLY_SMTP_PORT,
		secure: false,
	});

	await transporter.sendMail({
		from: env.EMAIL_FROM,
		html,
		subject,
		to,
	});
}
