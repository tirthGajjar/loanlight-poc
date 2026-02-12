import type { ClassificationRule } from "../types";

export const ASSET_RULES: readonly ClassificationRule[] = [
	{
		type: "bank_statement_personal",
		description: `Personal bank statement (checking, savings, or money market). Contains bank name/logo, account number, statement period, transaction list with deposits and withdrawals, ending balance.
NOT a brokerage statement (no securities positions).
NOT a mortgage statement (shows transactions, not loan balance).`,
	},
	{
		type: "bank_statement_business",
		description: `Business bank statement. Contains business entity name on account, bank name/logo, higher transaction volume, business account type. Same structure as personal but account holder is a business entity.
NOT a personal bank statement (business name, not individual).`,
	},
	{
		type: "brokerage_statement",
		description: `Brokerage or investment account statement. Contains securities positions (stocks, bonds, mutual funds), holdings summary, investment firm name, performance data.
NOT a bank statement (has investment positions, not just cash transactions).
NOT a retirement statement (general brokerage, not 401k/IRA specific).`,
	},
	{
		type: "gift_letter",
		description: `Gift letter for down payment funds. Contains donor name and relationship to borrower, recipient name, gift amount, explicit no-repayment statement, signatures from both parties.
NOT a loan agreement (explicitly states funds are a gift, not a loan).`,
	},
	{
		type: "source_large_deposits",
		description: `Source of large deposits documentation. Contains explanation and supporting evidence for large or unusual deposits in bank accounts. Look for "Source of Large Deposits", deposit explanations, supporting transaction records.
NOT a bank statement (explanation of specific deposits, not the full statement).`,
	},
];
