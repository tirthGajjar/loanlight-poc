import type { SplitCategory } from "./types";

/**
 * Stage 1 bucket categories for LlamaSplit.
 * Each description provides detailed indicators for AI classification.
 */
export const SPLIT_CATEGORIES: readonly SplitCategory[] = [
	{
		name: "income",
		description: `Employment and income verification documents including:
- W-2 forms showing annual wages and tax withholdings with boxes 1-12
- Paystubs with pay period dates, gross/net pay, and YTD totals
- 1099 forms (NEC, MISC, INT, DIV) for non-employee compensation
- Verification of Employment (VOE) letters with employer letterhead
- CPA letters confirming self-employment income
- P&L statements with revenue, expenses, and net income
- Bank statements used for income qualification (bank statement programs)
- Business income calculation worksheets
Look for: employer names, pay amounts, tax withholdings, earnings statements`,
	},
	{
		name: "assets",
		description: `Asset and reserve documentation including:
- Bank statements (checking, savings, money market) with transactions and balances
- Brokerage and investment account statements with securities positions
- Retirement account statements (401k, IRA) with holdings
- Gift letters documenting down payment fund gifts
- Source of large deposits documentation explaining unusual deposits
Look for: account numbers, ending balances, transaction histories, bank logos`,
	},
	{
		name: "tax_returns",
		description: `Federal tax return documents including:
- Form 1040 individual income tax returns with AGI and filing status
- Schedule C (business income), Schedule E (rental income)
- Schedule K-1 (partnership/S-Corp income allocation)
- Other IRS schedules and attachments
Look for: "Form 1040" header, IRS formatting, tax year, AGI line items`,
	},
	{
		name: "property",
		description: `Property-related documents EXCLUDING appraisals and title reports:
- Purchase contracts with buyer/seller, price, and contingencies
- Grant deeds, warranty deeds, and deeds of trust
- Hazard insurance and flood insurance policies/declarations pages
- Flood certificates (zone determination)
- Property trusts and entity vesting documents
- Property tax certificates
- Rental agreements for subject property
- Borrower/Owner/Purchaser Affidavits and Indemnity Affidavits
- Affidavits of Title (ownership, liens, debts, possession)
- Name Affidavits confirming borrower identity variations for title
Note: Appraisals belong in the appraisal bucket. Title commitments, prelim reports, and CPLs belong in the title bucket.
Look for: property addresses, legal descriptions, insurance policies, deeds, affidavit sworn statements`,
	},
	{
		name: "credit",
		description: `Credit and liability documents including:
- Tri-merge credit reports with Equifax, Experian, and TransUnion data
- Single-bureau credit reports with one bureau's data
- Mortgage statements showing loan balance and payment information
- Letters of explanation (LOE) for credit issues
- Verification of Mortgage (VOM) with payment history
- Payoff statements/demands with payoff amounts
- Rental payment history verification
Look for: FICO scores, tradelines, credit bureau names, loan numbers, LOE letters`,
	},
	{
		name: "identity",
		description: `Government-issued photo IDs and identification cards ONLY:
- Driver's licenses with state-issued formatting and photo
- Passports with country-issued formatting and photo page
- Social Security cards with SSN (XXX-XX-XXXX format)
- ITIN cards with Individual Taxpayer Identification Number (9XX-XX-XXXX)
IMPORTANT: Do NOT classify forms that collect personal information (SSN, DOB, address) for title search or closing purposes — those belong in property or disclosures.
Look for: government-issued ID formatting, photos, ID numbers, expiration dates`,
	},
	{
		name: "disclosures",
		description: `Loan disclosures, closing/escrow documents, and regulatory notices including:
- Closing Disclosure (CD) — typically 5 pages with final loan terms and closing costs
- Loan Estimate (LE) — typically 3 pages with estimated terms and APR
- ALTA Settlement Statement / HUD-1 Settlement Statement with line-item closing costs
- Escrow instructions, amendments, and New Financing Amendments
- Authorization to Disburse Funds and wire instruction forms
- Initial eDisclosures packages (unsigned)
- Interest rate lock confirmations
- Homeownership Counseling Organization Lists
- Your Home Loan Toolkit (CFPB booklet)
- Supplemental Consumer Information Forms
- Flood hazard notices to borrower
- Regulatory disclosures: GLBA Privacy Policy notices, Borrower's Rights notices
Look for: TRID formatting, "CLOSING DISCLOSURE" or "LOAN ESTIMATE" headers, settlement statement line items, lock confirmations, regulatory notices`,
	},
	{
		name: "business",
		description: `Business entity documentation including:
- Articles of incorporation or organization
- Business licenses and permits
- Operating agreements
Look for: business entity names, state filing numbers, corporate formation documents`,
	},
	{
		name: "appraisal",
		description: `Appraisal and property valuation reports including:
- Standard residential appraisal (URAR/Form 1004) with comparable sales analysis
- Form 1007 rent schedule appraisals with market rent data
- Desk reviews (CDA/Collateral Desktop Analysis)
- AIR (Appraisal Independence Requirements) certificates
- Reconsideration of Value (ROV) disclosures
- Fannie Mae Selling System Reports (SSR)
- Appraisal acknowledgement of receipt forms
Typically 20-40 pages with photos, comparable sales grids, and appraiser certifications.
Look for: "Form 1004", "URAR", appraiser certification, comparable sales grid, property photos, valuation`,
	},
	{
		name: "title",
		description: `Title company documents including:
- Preliminary title reports with current liens and legal description
- Title commitments with Schedule A/B and commitment language
- Closing Protection Letters (CPL) with indemnification language
- Title E&O (Errors and Omissions) attorney coverage
- Title escrow instructions from title company
- Property surveys and plat maps
Issued by title companies/underwriters with commitment numbers and legal descriptions.
Look for: "Title Commitment", "Preliminary Report", "CPL", title company letterhead, Schedule A/B`,
	},
	{
		name: "application",
		description: `Loan application documents including:
- Uniform Residential Loan Application (1003/URLA) with borrower financial data
- Transmittal Summary (Form 1008) with underwriting data
- IRS Form 4506-C/T tax transcript request authorization
Official mortgage application forms typically with sections numbered 1-9, borrower declarations, and signature blocks.
Look for: "Form 1003", "URLA", "Transmittal Summary", "Form 1008", "4506-C", "4506-T"`,
	},
	{
		name: "fraud",
		description: `Fraud, compliance, and audit reports including:
- DRIVE (Data Integrity Risk Evaluation) reports with risk scores
- LexisNexis identity verification reports
- Mavent or similar compliance audit reports
Automated scoring/audit output with risk indicators, compliance flags, and identity verification results.
Look for: "DRIVE", "LexisNexis", "Mavent", risk scores, compliance findings, fraud detection output`,
	},
	{
		name: "unknown",
		description: `Documents that truly cannot be classified into any other category.
Do NOT use this for closing/escrow administrative documents — those belong in disclosures.
Do NOT use this for title-related affidavits or sworn statements — those belong in property.
Do NOT use this for appraisals — those belong in appraisal.
Do NOT use this for title reports or CPLs — those belong in title.
Do NOT use this for loan applications (1003) or 4506 forms — those belong in application.
Do NOT use this for fraud/compliance reports — those belong in fraud.
Only use unknown when the document genuinely does not match any defined category above.`,
	},
];
