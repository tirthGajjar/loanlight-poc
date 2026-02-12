import type { ClassificationRule } from "../types";

export const INCOME_RULES: readonly ClassificationRule[] = [
	{
		type: "w2",
		description: `W-2 Wage and Tax Statement. Contains boxes labeled 1-12 with wage and tax information, employer EIN and name, employee SSN. Look for "Wage and Tax Statement" or "Form W-2" and the distinctive box layout.
NOT a 1099 (no "Nonemployee Compensation").
NOT a paystub (no pay period dates, shows annual totals only).`,
	},
	{
		type: "paystub",
		description: `Pay stub or earnings statement. Contains pay period start/end dates, gross pay and net pay amounts, YTD (year-to-date) earnings and deductions, employer name. Look for "Earnings Statement", "Pay Period", "YTD".
NOT a W-2 (has pay periods, not annual summary).
NOT a bank statement (no account transactions).`,
	},
	{
		type: "1099_nec",
		description: `Form 1099-NEC for Nonemployee Compensation. Contains payer info, recipient info, Box 1 compensation amount. Look for "Form 1099-NEC" or "Nonemployee Compensation".
NOT a W-2 (different form structure, non-employee relationship).
NOT a 1099-MISC (specifically for NEC after 2020).`,
	},
	{
		type: "written_voe",
		description: `Written Verification of Employment. Contains employer letterhead, employment dates, position title, salary information, HR signature. Official letter confirming employment.
NOT a verbal VOE (no phone call documentation).
NOT a paystub (letter format, not pay period details).`,
	},
	{
		type: "verbal_voe",
		description: `Verbal Verification of Employment documenting a phone call. Contains date/time of call, verifier name and title, employer phone number. Look for "Verbal Verification" template.
NOT a written VOE (documents a phone call, not a letter).
NOT an employment offer letter.`,
	},
	{
		type: "cpa_letter",
		description: `CPA or accountant letter confirming self-employment income. Contains CPA firm letterhead, CPA license number, self-employment confirmation.
NOT a P&L statement (letter format, not financial tables).
NOT a tax return (professional opinion letter).`,
	},
	{
		type: "pnl_statement",
		description: `Profit and Loss (P&L) statement for self-employed income. Contains revenue lines, expense categories, net income/profit, period dates. Often from QuickBooks or Excel.
NOT a bank statement (business profitability, not account transactions).
NOT a tax return (business report, not IRS form).`,
	},
	{
		type: "bank_statement_income",
		description: `Bank statements used specifically for income documentation (bank statement loan programs). Contains deposits highlighted as income, deposit analysis, average monthly deposits. Look for income annotations, deposit summaries used for qualifying.
NOT an asset bank statement (used for income qualification, not asset verification).`,
	},
	{
		type: "business_income_calc",
		description: `Business income calculation worksheet. Contains business revenue analysis, expense adjustments, net qualifying income calculation. Used by underwriters to calculate self-employment income. Look for "Business Income Calculation", "Cash Flow Analysis", income worksheet.
NOT a P&L statement (underwriter's calculation, not the business's own report).`,
	},
	{
		type: "income_loe",
		description: `Letter of Explanation for income gaps or changes. Borrower-written letter explaining employment gaps, income changes, or job transitions. Look for "Letter of Explanation", employment gap explanation, borrower signature.
NOT a credit LOE (explains income/employment, not credit issues).`,
	},
	{
		type: "contractor_license",
		description: `Contractor license or professional license used as income documentation. Contains license number, issuing authority, license holder name, expiration date. Look for "Contractor License", professional licensing body.
NOT a business license (individual professional license, supports self-employment income).`,
	},
];
