import type { ClassificationRule } from "../types";
import { APPLICATION_RULES } from "./application";
import { APPRAISAL_RULES } from "./appraisal";
import { ASSET_RULES } from "./assets";
import { BUSINESS_RULES } from "./business";
import { CREDIT_RULES } from "./credit";
import { DISCLOSURE_RULES } from "./disclosures";
import { FRAUD_RULES } from "./fraud";
import { IDENTITY_RULES } from "./identity";
import { INCOME_RULES } from "./income";
import { PROPERTY_RULES } from "./property";
import { TAX_RETURN_RULES } from "./tax-returns";
import { TITLE_RULES } from "./title";

/**
 * Classification rules keyed by bucket name.
 * Each bucket maps to subtype rules used by LlamaClassify in Stage 2.
 */
export const CLASSIFICATION_RULES: Readonly<
	Record<string, readonly ClassificationRule[]>
> = {
	application: APPLICATION_RULES,
	appraisal: APPRAISAL_RULES,
	assets: ASSET_RULES,
	business: BUSINESS_RULES,
	credit: CREDIT_RULES,
	disclosures: DISCLOSURE_RULES,
	fraud: FRAUD_RULES,
	identity: IDENTITY_RULES,
	income: INCOME_RULES,
	property: PROPERTY_RULES,
	tax_returns: TAX_RETURN_RULES,
	title: TITLE_RULES,
};
