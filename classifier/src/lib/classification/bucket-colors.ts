/** Shared color map giving each document bucket a distinct visual identity. */

import {
	BankIcon,
	Building03Icon,
	CreditCardIcon,
	DollarSquareIcon,
	FileEditIcon,
	FileValidationIcon,
	HelpCircleIcon,
	Home01Icon,
	Search01Icon,
	Shield01Icon,
	Stamp01Icon,
	TaxesIcon,
	UserIdVerificationIcon,
} from "@hugeicons/core-free-icons";

/** Icon definitions (plain data objects) for each bucket — render with HugeiconsIcon. */
export const BUCKET_ICONS: Record<string, typeof BankIcon> = {
	INCOME: DollarSquareIcon,
	ASSETS: BankIcon,
	TAX_RETURNS: TaxesIcon,
	PROPERTY: Home01Icon,
	CREDIT: CreditCardIcon,
	IDENTITY: UserIdVerificationIcon,
	DISCLOSURES: FileValidationIcon,
	BUSINESS: Building03Icon,
	APPRAISAL: Search01Icon,
	TITLE: Stamp01Icon,
	APPLICATION: FileEditIcon,
	FRAUD: Shield01Icon,
	UNKNOWN: HelpCircleIcon,
};

// biome-ignore lint: UNKNOWN is defined above
const FALLBACK_ICON = BUCKET_ICONS.UNKNOWN!;

export function getBucketIcon(
	bucket: string | null | undefined,
): typeof FALLBACK_ICON {
	if (!bucket) return FALLBACK_ICON;
	return BUCKET_ICONS[bucket.toUpperCase()] ?? FALLBACK_ICON;
}

export interface BucketColor {
	bg: string;
	text: string;
	border: string;
	label: string;
}

export const BUCKET_COLORS: Record<string, BucketColor> = {
	INCOME: {
		bg: "bg-emerald-100",
		text: "text-emerald-700",
		border: "border-emerald-400",
		label: "Income",
	},
	ASSETS: {
		bg: "bg-blue-100",
		text: "text-blue-700",
		border: "border-blue-400",
		label: "Assets",
	},
	TAX_RETURNS: {
		bg: "bg-violet-100",
		text: "text-violet-700",
		border: "border-violet-400",
		label: "Tax Returns",
	},
	PROPERTY: {
		bg: "bg-amber-100",
		text: "text-amber-700",
		border: "border-amber-400",
		label: "Property",
	},
	CREDIT: {
		bg: "bg-rose-100",
		text: "text-rose-700",
		border: "border-rose-400",
		label: "Credit",
	},
	IDENTITY: {
		bg: "bg-cyan-100",
		text: "text-cyan-700",
		border: "border-cyan-400",
		label: "Identity",
	},
	DISCLOSURES: {
		bg: "bg-orange-100",
		text: "text-orange-700",
		border: "border-orange-400",
		label: "Disclosures",
	},
	BUSINESS: {
		bg: "bg-teal-100",
		text: "text-teal-700",
		border: "border-teal-400",
		label: "Business",
	},
	APPRAISAL: {
		bg: "bg-indigo-100",
		text: "text-indigo-700",
		border: "border-indigo-400",
		label: "Appraisal",
	},
	TITLE: {
		bg: "bg-fuchsia-100",
		text: "text-fuchsia-700",
		border: "border-fuchsia-400",
		label: "Title",
	},
	APPLICATION: {
		bg: "bg-sky-100",
		text: "text-sky-700",
		border: "border-sky-400",
		label: "Application",
	},
	FRAUD: {
		bg: "bg-red-100",
		text: "text-red-700",
		border: "border-red-400",
		label: "Fraud",
	},
	UNKNOWN: {
		bg: "bg-gray-100",
		text: "text-gray-600",
		border: "border-gray-400",
		label: "Unknown",
	},
};

// biome-ignore lint: UNKNOWN is defined above
const FALLBACK: BucketColor = BUCKET_COLORS.UNKNOWN!;

export function getBucketColor(bucket: string | null | undefined): BucketColor {
	if (!bucket) return FALLBACK;
	return BUCKET_COLORS[bucket.toUpperCase()] ?? FALLBACK;
}

export function formatBucket(bucket: string): string {
	const color: BucketColor | undefined = BUCKET_COLORS[bucket.toUpperCase()];
	return (
		color?.label ??
		bucket.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
	);
}

export function formatSubtype(subtype: string): string {
	return subtype.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
