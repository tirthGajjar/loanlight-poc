import { additionalPackages } from "@trigger.dev/build/extensions/core";
import { prismaExtension } from "@trigger.dev/build/extensions/prisma";
import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
	project: "proj_kdvvmdgdacxmomcpmozg",
	dirs: ["./trigger"],
	maxDuration: 300,
	build: {
		extensions: [
			additionalPackages({ packages: ["@prisma/client"] }),
			{
				name: "prisma-skip-autoinstall",
				onBuildComplete(context) {
					context.addLayer({
						id: "prisma-skip-autoinstall",
						build: {
							env: {
								PRISMA_GENERATE_SKIP_AUTOINSTALL: "true",
								SKIP_ENV_VALIDATION: "true",
							},
						},
					});
				},
			},
			prismaExtension({
				mode: "legacy",
				schema: "prisma/schema.prisma",
			}),
		],
	},
	retries: {
		enabledInDev: false,
		default: {
			maxAttempts: 3,
			minTimeoutInMs: 1000,
			maxTimeoutInMs: 10000,
			factor: 2,
			randomize: true,
		},
	},
});
