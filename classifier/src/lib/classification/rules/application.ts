import type { ClassificationRule } from "../types";

export const APPLICATION_RULES: readonly ClassificationRule[] = [
	{
		type: "urla_1003",
		description: `Uniform Residential Loan Application (URLA / Form 1003). Contains borrower information, employment, assets, liabilities, loan terms, declarations. Multi-page form with sections numbered 1-9. Look for "Uniform Residential Loan Application", "Form 1003", or "URLA".
NOT a Loan Estimate (application form, not a disclosure).`,
	},
	{
		type: "transmittal_1008",
		description: `Transmittal Summary (Form 1008). Contains loan data summary for underwriting: borrower info, property, loan terms, qualifying ratios. Look for "Transmittal Summary", "Form 1008", underwriting data summary.
NOT the URLA (summary form, not the full application).`,
	},
	{
		type: "form_4506",
		description: `IRS Form 4506-C or 4506-T (Request for Transcript of Tax Return). Contains taxpayer information, tax form numbers, years requested, signature authorization for IRS transcript. Look for "4506-C", "4506-T", "Request for Transcript".
NOT a tax return itself (authorization form to obtain transcripts from IRS).`,
	},
];
