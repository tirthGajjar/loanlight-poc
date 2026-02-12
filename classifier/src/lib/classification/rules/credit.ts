import type { ClassificationRule } from "../types";

export const CREDIT_RULES: readonly ClassificationRule[] = [
	{
		type: "credit_report_trimerge",
		description: `Tri-merge credit report combining all three bureaus. Contains data from Equifax, Experian, AND TransUnion, multiple FICO scores, combined tradeline listing.
NOT a single-bureau report (has all three bureaus present).`,
	},
	{
		type: "credit_report_single",
		description: `Single-bureau credit report from one credit bureau. Contains data from only ONE of Equifax, Experian, or TransUnion, single FICO score.
NOT a tri-merge report (only one bureau's data present).`,
	},
	{
		type: "mortgage_statement",
		description: `Mortgage or loan servicing statement. Contains loan number, payment due, principal balance, escrow balance, servicer name. Look for "Current Payment Due", loan servicing details.
NOT a bank statement (loan balance and payment info, not deposit/withdrawal transactions).`,
	},
	{
		type: "letter_of_explanation",
		description: `Letter of Explanation (LOE) for credit issues. Borrower-written letter explaining credit inquiries, late payments, collections, or other derogatory items. Look for "Letter of Explanation", "LOE", borrower signature, explanation of credit events.
NOT an income LOE (explains credit history, not income gaps).`,
	},
	{
		type: "verification_of_mortgage",
		description: `Verification of Mortgage (VOM). Contains mortgage payment history, current balance, payment amount, loan origination date. Issued by existing mortgage servicer. Look for "Verification of Mortgage", "VOM", payment history grid.
NOT a mortgage statement (verification form with payment history, not monthly statement).`,
	},
	{
		type: "payoff_statement",
		description: `Payoff statement or payoff demand letter. Contains current principal balance, per diem interest, payoff good-through date, wire instructions. Look for "Payoff Statement", "Payoff Demand", good-through date.
NOT a mortgage statement (one-time payoff amount, not monthly payment info).`,
	},
	{
		type: "rental_history",
		description: `Rental payment history verification. Contains landlord/property manager contact, rent amount, payment history, tenancy dates. Look for "Rental History", "Verification of Rent", landlord attestation.
NOT a lease agreement (payment history verification, not the lease itself).`,
	},
];
