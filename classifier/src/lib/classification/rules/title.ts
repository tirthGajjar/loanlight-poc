import type { ClassificationRule } from "../types";

export const TITLE_RULES: readonly ClassificationRule[] = [
	{
		type: "preliminary_title",
		description: `Preliminary Title Report. Contains current liens, legal description, ownership. Look for "Preliminary Report" or "Prelim". NO Schedule A/B, NO commitment language.
NOT a Title Commitment (no commitment or insurance language).`,
	},
	{
		type: "title_commitment",
		description: `Title Commitment for Title Insurance. Contains Schedule A (proposed insured, loan amount), Schedule B (requirements and exceptions), commitment number. Look for "Commitment for Title Insurance" and Schedule A/B structure.
NOT a Preliminary Title Report (HAS commitment language and Schedule A/B).`,
	},
	{
		type: "closing_protection_letter",
		description: `Closing Protection Letter (CPL). Contains CPL number, settlement agent, indemnification language. Typically 1-2 pages, issued by title insurer.
NOT a title commitment (short letter format, not full commitment).`,
	},
	{
		type: "title_eo_coverage",
		description: `Title E&O (Errors and Omissions) Attorney Coverage letter. Professional liability coverage documentation for title attorneys/agents. Look for "E&O", "Errors and Omissions", attorney coverage.
NOT a title commitment (insurance coverage for the title agent, not property title).`,
	},
	{
		type: "title_escrow_instructions",
		description: `Title escrow instructions from the title company. Contains title company terms and conditions for holding escrow, closing procedures. Look for title company letterhead with escrow instructions.
NOT general escrow instructions from the lender (issued by the title company specifically).`,
	},
	{
		type: "title_survey",
		description: `Property survey or plat map prepared for title purposes. Contains boundary lines, easements, encroachments, surveyor certification. Look for survey drawings, metes and bounds, surveyor seal.
NOT an appraisal (survey/plat, not a valuation report).`,
	},
];
