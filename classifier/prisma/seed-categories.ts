import { PrismaClient } from "../generated/prisma";
import { SPLIT_CATEGORIES } from "../src/lib/classification/categories";
import { ENCOMPASS_FOLDER_MAP } from "../src/lib/classification/encompass-map";
import { CLASSIFICATION_RULES } from "../src/lib/classification/rules";

const prisma = new PrismaClient();

async function main() {
	const existing = await prisma.categoryDefinitionVersion.findFirst({
		where: { status: "PUBLISHED" },
	});
	if (existing) {
		console.log("Published version already exists, skipping seed.");
		return;
	}

	// Find an admin user (or first user) to set as creator
	const admin =
		(await prisma.user.findFirst({ where: { role: "admin" } })) ??
		(await prisma.user.findFirst());
	if (!admin) {
		console.error("No users found. Run the main seed first.");
		process.exit(1);
	}

	const version = await prisma.categoryDefinitionVersion.create({
		data: {
			createdById: admin.id,
			publishedAt: new Date(),
			publishedById: admin.id,
			status: "PUBLISHED",
		},
	});
	console.log(`Created version ${version.version} (PUBLISHED)`);

	for (const [i, cat] of SPLIT_CATEGORIES.entries()) {
		const rules = CLASSIFICATION_RULES[cat.name] ?? [];

		const subtypes = rules.map((rule, j) => ({
			description: rule.description,
			encompassFolder: ENCOMPASS_FOLDER_MAP[rule.type] ?? "",
			sortOrder: j + 1,
			type: rule.type,
		}));

		await prisma.categoryDefinition.create({
			data: {
				description: cat.description,
				name: cat.name,
				sortOrder: i + 1,
				subtypes: { create: subtypes },
				versionId: version.id,
			},
		});
		console.log(`  ${cat.name}: ${subtypes.length} subtypes`);
	}

	console.log("\nCategory seed completed!");
}

main()
	.catch((e) => {
		console.error("Error seeding categories:", e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
