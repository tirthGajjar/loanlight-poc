/** Category definition for LlamaSplit Stage 1 bucket classification */
export interface SplitCategory {
	readonly name: string;
	readonly description: string;
}

/** Classification rule for LlamaClassify Stage 2 subtype classification */
export interface ClassificationRule {
	readonly type: string;
	readonly description: string;
}

/** Confidence thresholds for classification decisions */
export interface ConfidenceThresholds {
	readonly AUTO_ACCEPT: number;
	readonly FLAG_FOR_REVIEW: number;
}
