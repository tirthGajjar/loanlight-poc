import type { ClassificationRule } from "../types";

export const APPRAISAL_RULES: readonly ClassificationRule[] = [
	{
		type: "appraisal_standard",
		description: `Standard residential appraisal (URAR/Form 1004). Contains property value, comparable sales grid, photos, appraiser certification. Look for "URAR", "Form 1004", sales comparison approach.
NOT a Form 1007 rent schedule (no rental income or rent comparables).`,
	},
	{
		type: "appraisal_1007",
		description: `Appraisal with Rent Schedule (Form 1007). Contains market rent estimate, rent comparables, Gross Rent Multiplier (GRM). Look for "Form 1007", "Comparable Rent Schedule".
NOT a standard appraisal without the rent analysis section.`,
	},
	{
		type: "desk_review",
		description: `Collateral Desktop Analysis (CDA) or desk review appraisal. Contains appraisal review opinion, value reconciliation, analysis of original appraisal. Look for "Desk Review", "CDA", "Collateral Desktop Analysis".
NOT a full appraisal (review of an existing appraisal, not a new one).`,
	},
	{
		type: "air_cert",
		description: `Appraisal Independence Requirements (AIR) Certificate. Certifies appraiser independence from lender influence. Short form with attestations about independence. Look for "AIR", "Appraisal Independence".
NOT a full appraisal (compliance certificate only, typically 1-2 pages).`,
	},
	{
		type: "rov_disclosure",
		description: `Reconsideration of Value (ROV) Disclosure. Contains information about borrower's right to request appraisal reconsideration. Look for "Reconsideration of Value", "ROV", appraisal dispute rights.
NOT an appraisal report (disclosure about the ROV process).`,
	},
	{
		type: "fnma_ssr",
		description: `Fannie Mae Selling System Report (SSR) for appraisal. Contains Fannie Mae automated underwriting appraisal findings, risk flags, property data. Look for "SSR", "Selling System", Fannie Mae formatting.
NOT an appraisal report (automated findings report from Fannie Mae).`,
	},
	{
		type: "appraisal_acknowledgement",
		description: `Appraisal Acknowledgement of Receipt. Confirms borrower received a copy of the appraisal. Short form with borrower signature and date. Look for "Acknowledgement of Receipt", "appraisal copy".
NOT an appraisal report (receipt acknowledgement only, typically 1 page).`,
	},
];
