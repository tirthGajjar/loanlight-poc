import type { ClassificationRule } from "../types";

export const DISCLOSURE_RULES: readonly ClassificationRule[] = [
	{
		type: "closing_disclosure",
		description: `Closing Disclosure (CD) — TRID-required disclosure. Typically 5 pages with final loan terms, projected payments, closing costs, cash to close. Look for "CLOSING DISCLOSURE" header on page 1.
NOT a Loan Estimate (5 pages vs 3 pages, final terms vs estimated).`,
	},
	{
		type: "loan_estimate",
		description: `Loan Estimate (LE) — TRID-required disclosure. Typically 3 pages with estimated loan terms, projected payments, estimated closing costs, APR. Look for "LOAN ESTIMATE" header on page 1.
NOT a Closing Disclosure (3 pages vs 5 pages, estimated vs final).`,
	},
	{
		type: "alta_settlement",
		description: `ALTA Settlement Statement or HUD-1 Settlement Statement. Contains line-item closing costs, debits/credits for buyer and seller, prorations, and recording fees. Look for "ALTA Settlement Statement", "HUD-1", or columnar debit/credit format.
NOT a Closing Disclosure (different format, may predate TRID).`,
	},
	{
		type: "escrow_instructions",
		description: `Escrow instructions, escrow amendments, or New Financing Amendments. Contains terms and conditions for the escrow holder, parties' obligations, closing conditions, and amendment language. Look for "Escrow Instructions", "Amendment", "New Financing".
NOT a purchase contract (escrow execution terms, not sale terms).`,
	},
	{
		type: "authorization_to_disburse",
		description: `Authorization to Disburse Funds or wire instruction forms. Contains disbursement authorization language, wire transfer details, account routing information, and authorized signatures. Look for "Authorization to Disburse", "Wire Instructions", "Disbursement".
NOT an escrow instruction (specific to fund release, not general escrow terms).`,
	},
	{
		type: "initial_edisclosures",
		description: `Initial eDisclosures package (unsigned). Contains the initial set of loan disclosures delivered electronically to the borrower before signing. Look for "Initial Disclosures", "eDisclosures", electronic delivery confirmation.
NOT a Closing Disclosure (initial disclosures at application, not closing).`,
	},
	{
		type: "lock_confirmation",
		description: `Interest rate lock confirmation. Contains locked rate, lock period/expiration date, loan amount, lock terms. Look for "Lock Confirmation", "Rate Lock", locked interest rate, lock expiration.
NOT a Loan Estimate (rate lock specific, not full LE disclosure).`,
	},
	{
		type: "homeownership_counseling",
		description: `Homeownership Counseling Organization List. Contains HUD-approved counseling agency list provided to borrower. Look for "Homeownership Counseling", HUD-approved agencies, counseling services list.
NOT a Home Loan Toolkit (agency list, not the educational booklet).`,
	},
	{
		type: "home_loan_toolkit",
		description: `Your Home Loan Toolkit (CFPB booklet). Consumer education booklet about the mortgage process. Look for "Your Home Loan Toolkit", CFPB branding, educational content about home buying.
NOT a disclosure form (educational booklet, not a legal disclosure).`,
	},
	{
		type: "supplemental_consumer_info",
		description: `Supplemental Consumer Information Form. Contains additional borrower data collection for fair lending and demographic monitoring. Look for "Supplemental Consumer Information", demographic questions, monitoring information.
NOT a loan application (supplemental data collection form, not the URLA).`,
	},
	{
		type: "flood_hazard_notice",
		description: `Flood hazard determination notice to borrower. Notifies borrower that property is in a flood zone and flood insurance may be required. Look for "Flood Hazard Notice", "Notice to Borrower", flood zone notification.
NOT a flood certificate (notice to borrower, not the determination itself).`,
	},
];
