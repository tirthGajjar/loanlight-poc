import type { ClassificationRule } from "../types";

export const IDENTITY_RULES: readonly ClassificationRule[] = [
	{
		type: "drivers_license",
		description: `State-issued driver's license. Contains photo, date of birth, address, license number, state-specific design. Look for front/back card images.
NOT a passport (state-issued, not federal/country-issued).`,
	},
	{
		type: "passport",
		description: `Country-issued passport. Contains photo page, passport number, nationality, expiration date. Look for passport formatting and biographic data page.
NOT a driver's license (federal/country-issued, not state-issued).`,
	},
	{
		type: "social_security_card",
		description: `Social Security card issued by the SSA. Contains SSN in XXX-XX-XXXX format, legal name, blue and white design. Look for "Social Security" text.
NOT an ITIN card (SSN format, not 9XX prefix).`,
	},
	{
		type: "itin_card",
		description: `ITIN card issued by the IRS. Contains ITIN in 9XX-XX-XXXX format (always starts with 9). Look for "ITIN" label and IRS issuance.
NOT a Social Security card (9XX prefix, issued by IRS not SSA).`,
	},
];
