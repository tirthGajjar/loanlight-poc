import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import PasswordResetEmail from "@/emails/password-reset";
import VerifyEmail from "@/emails/verify-email";
import { env } from "@/env";
import { db } from "@/server/db";
import { sendEmail } from "@/server/email";

export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL,
	database: prismaAdapter(db, {
		provider: "postgresql",
	}),
	plugins: [admin()],
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 8,
		maxPasswordLength: 128,
		requireEmailVerification: true,
		autoSignIn: false,
		sendResetPassword: async ({ user, url }) => {
			await sendEmail({
				to: user.email,
				subject: "Reset your password",
				react: PasswordResetEmail({
					resetUrl: url,
					userEmail: user.email,
				}),
			});
		},
	},
	emailVerification: {
		sendOnSignUp: true,
		sendVerificationEmail: async ({ user, url }) => {
			await sendEmail({
				to: user.email,
				subject: "Verify your email address",
				react: VerifyEmail({
					verificationUrl: url,
				}),
			});
		},
	},
});

export type Session = typeof auth.$Infer.Session;
