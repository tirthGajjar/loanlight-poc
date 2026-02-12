import { scryptAsync } from "@noble/hashes/scrypt.js";
import { bytesToHex, randomBytes } from "@noble/hashes/utils.js";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

// Better Auth password hashing config (must match their implementation)
const SCRYPT_CONFIG = {
	N: 16384,
	r: 16,
	p: 1,
	dkLen: 64,
};

async function hashPassword(password: string): Promise<string> {
	const salt = bytesToHex(randomBytes(16));
	const key = await scryptAsync(password.normalize("NFKC"), salt, {
		N: SCRYPT_CONFIG.N,
		r: SCRYPT_CONFIG.r,
		p: SCRYPT_CONFIG.p,
		dkLen: SCRYPT_CONFIG.dkLen,
		maxmem: 128 * SCRYPT_CONFIG.N * SCRYPT_CONFIG.r * 2,
	});
	return `${salt}:${bytesToHex(key)}`;
}

function generateId(): string {
	return bytesToHex(randomBytes(16));
}

interface SeedUser {
	name: string;
	email: string;
	password: string;
}

const TEST_USERS: SeedUser[] = [
	{
		name: "Test User",
		email: "test@example.com",
		password: "password123",
	},
	{
		name: "Demo User",
		email: "demo@example.com",
		password: "password123",
	},
];

async function createUser(userData: SeedUser): Promise<void> {
	const existingUser = await prisma.user.findUnique({
		where: { email: userData.email },
	});

	if (existingUser) {
		console.log(`User ${userData.email} already exists, skipping...`);
		return;
	}

	const userId = generateId();
	const accountId = generateId();
	const hashedPassword = await hashPassword(userData.password);

	await prisma.user.create({
		data: {
			id: userId,
			name: userData.name,
			email: userData.email,
			emailVerified: true,
			accounts: {
				create: {
					id: accountId,
					accountId: userId,
					providerId: "credential",
					password: hashedPassword,
				},
			},
		},
	});

	console.log(`Created user: ${userData.email}`);
}

async function main(): Promise<void> {
	console.log("Seeding database...\n");

	// Create admin user from env vars if provided
	const adminEmail = process.env.SEED_ADMIN_EMAIL;
	const adminPassword = process.env.SEED_ADMIN_PASSWORD;
	const adminName = process.env.SEED_ADMIN_NAME ?? "Admin";

	if (adminEmail && adminPassword) {
		await createUser({
			name: adminName,
			email: adminEmail,
			password: adminPassword,
		});
	} else {
		console.log(
			"No SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD set, skipping admin user creation",
		);
	}

	// Create test users
	console.log("\nCreating test users...");
	for (const user of TEST_USERS) {
		await createUser(user);
	}

	console.log("\nSeeding completed!");
}

main()
	.catch((e) => {
		console.error("Error seeding database:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
