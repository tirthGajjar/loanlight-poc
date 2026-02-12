import type { ClassificationRule } from "../types";

export const FRAUD_RULES: readonly ClassificationRule[] = [
	{
		type: "drive_report",
		description: `DRIVE (Data Integrity Risk Evaluation) report. Automated fraud detection report with risk scores, data integrity flags, and borrower risk indicators. Look for "DRIVE", "Data Integrity", risk scoring tables.
NOT a credit report (fraud/risk assessment, not credit history).`,
	},
	{
		type: "lexis_nexis",
		description: `LexisNexis identity verification or risk report. Contains identity verification results, address history, SSN validation, public records search. Look for "LexisNexis", identity verification results, risk indicators.
NOT a credit report (identity verification and fraud check, not credit tradelines).`,
	},
	{
		type: "compliance_report",
		description: `Compliance audit report (e.g., Mavent). Contains regulatory compliance check results, HMDA data validation, fair lending analysis, predatory lending flags. Look for "Mavent", "Compliance", regulatory audit output.
NOT a fraud report (regulatory compliance check, not identity/data fraud detection).`,
	},
];
