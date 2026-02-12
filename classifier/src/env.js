import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	/**
	 * Specify your server-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars.
	 */
	server: {
		BETTER_AUTH_SECRET:
			process.env.NODE_ENV === "production"
				? z.string()
				: z.string().optional(),
		BETTER_AUTH_URL: z.string().url().optional(),
		DATABASE_URL: z.string().url(),
		EMAIL_FROM: z.string().default("LoanLight <onboarding@resend.dev>"),
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
		RESEND_API_KEY:
			process.env.NODE_ENV === "production"
				? z.string()
				: z.string().optional(),
		LOCAL_ONLY_SMTP_HOST: z.string().default("localhost"),
		LOCAL_ONLY_SMTP_PORT: z.coerce.number().default(1025),
		S3_ENDPOINT: z.string().url().optional(),
		S3_REGION: z.string().default("us-east-1"),
		S3_ACCESS_KEY: z.string(),
		S3_SECRET_KEY: z.string(),
		S3_BUCKET: z.string().default("loanlight-documents"),
		TRIGGER_SECRET_KEY: z.string(),
		LLAMACLOUD_API_KEY: z.string(),
	},

	/**
	 * Specify your client-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars. To expose them to the client, prefix them with
	 * `NEXT_PUBLIC_`.
	 */
	client: {
		// NEXT_PUBLIC_CLIENTVAR: z.string(),
	},

	/**
	 * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
	 * middlewares) or client-side so we need to destruct manually.
	 */
	runtimeEnv: {
		BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
		BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
		DATABASE_URL: process.env.DATABASE_URL,
		EMAIL_FROM: process.env.EMAIL_FROM,
		NODE_ENV: process.env.NODE_ENV,
		RESEND_API_KEY: process.env.RESEND_API_KEY,
		LOCAL_ONLY_SMTP_HOST: process.env.LOCAL_ONLY_SMTP_HOST,
		LOCAL_ONLY_SMTP_PORT: process.env.LOCAL_ONLY_SMTP_PORT,
		S3_ENDPOINT: process.env.S3_ENDPOINT,
		S3_REGION: process.env.S3_REGION,
		S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
		S3_SECRET_KEY: process.env.S3_SECRET_KEY,
		S3_BUCKET: process.env.S3_BUCKET,
		TRIGGER_SECRET_KEY: process.env.TRIGGER_SECRET_KEY,
		LLAMACLOUD_API_KEY: process.env.LLAMACLOUD_API_KEY,
	},
	/**
	 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
	 * useful for Docker builds.
	 */
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	/**
	 * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
	 * `SOME_VAR=''` will throw an error.
	 */
	emptyStringAsUndefined: true,
});
