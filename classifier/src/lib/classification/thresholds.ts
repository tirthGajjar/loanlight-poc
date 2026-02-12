import type { ConfidenceThresholds } from "./types";

export const CONFIDENCE_THRESHOLDS: ConfidenceThresholds = {
	AUTO_ACCEPT: 0.85,
	FLAG_FOR_REVIEW: 0.6,
};

/**
 * Determine the confidence level and review requirement from a numeric score.
 */
export function getConfidenceLevel(confidence: number) {
	if (confidence >= CONFIDENCE_THRESHOLDS.AUTO_ACCEPT) {
		return { level: "HIGH" as const, requiresReview: false };
	}
	if (confidence >= CONFIDENCE_THRESHOLDS.FLAG_FOR_REVIEW) {
		return { level: "MEDIUM" as const, requiresReview: true };
	}
	return { level: "LOW" as const, requiresReview: true };
}
