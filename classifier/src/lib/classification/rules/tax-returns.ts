import type { ClassificationRule } from "../types";

export const TAX_RETURN_RULES: readonly ClassificationRule[] = [
	{
		type: "form_1040",
		description: `IRS Form 1040 Individual Income Tax Return. Contains filing status, adjusted gross income (AGI), tax calculations, signature line. Look for "Form 1040" header, IRS formatting, multi-page with numbered lines.
NOT a schedule (this is the main return form).
NOT a W-2 (tax return filed by taxpayer, not employer wage statement).`,
	},
	{
		type: "schedule_c",
		description: `IRS Schedule C (Profit or Loss From Business). Contains business name, gross receipts, expenses by category, net profit. Look for "Schedule C (Form 1040)" header, sole proprietorship income.
NOT a P&L statement (IRS form, attached to 1040).
NOT a Schedule E (business income, not rental income).`,
	},
	{
		type: "schedule_e",
		description: `IRS Schedule E (Supplemental Income and Loss). Contains rental property addresses, rental income, rental expenses by category. Look for "Schedule E (Form 1040)" header, property income tables.
NOT a lease agreement (IRS tax form, not a rental contract).
NOT a Schedule C (rental income, not business income).`,
	},
	{
		type: "schedule_k1",
		description: `IRS Schedule K-1 (Partner's/Shareholder's Share of Income). Contains partnership or S-Corp income allocation, partner info, income and deduction boxes. Look for "Schedule K-1" header.
NOT a Form 1040 (supplemental schedule, not the main return).`,
	},
];
