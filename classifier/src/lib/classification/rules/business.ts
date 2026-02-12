import type { ClassificationRule } from "../types";

export const BUSINESS_RULES: readonly ClassificationRule[] = [
	{
		type: "articles_of_incorporation",
		description: `Articles of Incorporation or Organization. Contains business name, state of formation, registered agent, filing date, state filing number.
NOT an operating agreement (formation document filed with state, not internal governance).`,
	},
	{
		type: "business_license",
		description: `Business license or permit issued by a government authority. Contains business name, license number, issuing authority, expiration date.
NOT articles of incorporation (license to operate, not formation document).`,
	},
];
