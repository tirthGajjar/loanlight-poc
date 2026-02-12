/**
 * Maps document subtypes to their Encompass e-folder paths.
 * Based on the Luxury Mortgage x Ocrolus folder mapping.
 *
 * Keys are subtype identifiers matching ClassificationRule.type values.
 */
export const ENCOMPASS_FOLDER_MAP: Readonly<Record<string, string>> = {
	// Income
	w2: "Income: W-2's",
	paystub: "Income: Paystubs",
	written_voe: "Income: Written VOE",
	verbal_voe: "Income: Written VOE",
	"1099_nec": "Income: 1099's",
	cpa_letter: "Income: Written VOE",
	pnl_statement: "Income: Written VOE",
	bank_statement_income: "Income: Bank Statements",
	business_income_calc: "Income: Business Income Calculation",
	income_loe: "Income: LOE",
	contractor_license: "Income: Verbal VOE & Supporting Documentation",

	// Assets
	bank_statement_personal: "Assets: Bank Statements/ Mutual Funds",
	bank_statement_business: "Assets: Bank Statements/ Mutual Funds",
	brokerage_statement: "Assets: Bank Statements/ Mutual Funds",
	gift_letter: "Assets: Gift Letters",
	source_large_deposits: "Assets: Source of Large Deposits",

	// Tax returns
	form_1040: "Income: 1040's with Schedules",
	schedule_c: "Income: 1040's with Schedules",
	schedule_e: "Income: 1040's with Schedules",
	schedule_k1: "Income: K-1's",

	// Property
	purchase_contract: "Property: Contract of Sale -subject property",
	grant_deed: "Property: Recorded Documents",
	deed_of_trust: "Property: Recorded Documents",
	affidavit_of_title: "Title Report",
	owner_affidavit: "Title Report",
	name_affidavit: "Title Report",
	hazard_insurance: "Property: Hazard Insurance & Paid Receipt",
	flood_insurance: "Property: Flood Insurance and Paid Receipt",
	flood_certificate: "Flood Certificate",
	trust: "Property: Trust",
	tax_certificate: "Property: Tax",
	rental_agreement: "Property: Rental Agreement Subject",
	entity_vesting: "Property: Other",
	warranty_deed: "Property: Recorded Documents",

	// Credit
	credit_report_trimerge: "Credit Report",
	credit_report_single: "Credit Report",
	mortgage_statement: "Credit Report",
	letter_of_explanation: "Credit: Letter of Explanation (LOE)",
	verification_of_mortgage: "Credit: VOM",
	payoff_statement: "Credit: Payoff Statement",
	rental_history: "Credit: Rental History",

	// Identity
	drivers_license: "Credit: Photo ID",
	passport: "Credit: Photo ID",
	social_security_card: "Credit: Photo ID",
	itin_card: "Credit: Photo ID",

	// Disclosures
	closing_disclosure: "Closing Disclosure",
	loan_estimate: "Loan Estimate",
	alta_settlement: "Closing Disclosure",
	escrow_instructions: "Closing Disclosure",
	authorization_to_disburse: "Closing Disclosure",
	initial_edisclosures: "*Initial eDisclosures - Unsigned",
	lock_confirmation: "*Lock Confirmation",
	homeownership_counseling: "Homeownership Counseling Orig List",
	home_loan_toolkit: "Your Home Loan Toolkit",
	supplemental_consumer_info: "Supplemental Consumer Information Form",
	flood_hazard_notice: "Property: Flood Hazard Notice",

	// Appraisal
	appraisal_standard: "Appraisal",
	appraisal_1007: "Appraisal",
	desk_review: "Appraisal: Desk Review",
	air_cert: "Appraisal",
	rov_disclosure: "Appraisal: 2nd ROV Disclosure",
	fnma_ssr: "Appraisal",
	appraisal_acknowledgement: "Appraisal: Acknowledgement of Receipt",

	// Title
	preliminary_title: "Title Report",
	title_commitment: "Title Report",
	closing_protection_letter: "Title: Closing Protection Letter",
	title_eo_coverage: "Title: E&O Attorney",
	title_escrow_instructions: "Title: Escrow Instructions",
	title_survey: "Title: Survey",

	// Application
	urla_1003: "QC: 1003-URLA",
	transmittal_1008: "QC: 1008",
	form_4506: "4506-T Request for Transcript Disclosure",

	// Business
	articles_of_incorporation: "Business: Entity Documents",
	business_license: "Business: Entity Documents",

	// Fraud
	drive_report: "Fraud",
	lexis_nexis: "Fraud",
	compliance_report: "Compliance Report",
};
