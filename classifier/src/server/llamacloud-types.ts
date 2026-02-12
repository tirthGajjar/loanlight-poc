/**
 * Re-exported LlamaCloud SDK types used throughout the pipeline.
 * Import from here instead of directly from @llamaindex/llama-cloud.
 */
import type { LlamaCloud } from "@llamaindex/llama-cloud";

/** LlamaCloud file upload response (contains file id) */
export type LlamaFile = LlamaCloud.FileCreateResponse;

/** LlamaCloud file upload params */
export type LlamaFileParams = LlamaCloud.FileCreateParams;

/** LlamaSplit segment — category, pages, confidence */
export type LlamaSplitSegment = LlamaCloud.Beta.SplitSegmentResponse;

/** LlamaSplit result containing all segments */
export type LlamaSplitResult = LlamaCloud.Beta.SplitResultResponse;

/** LlamaSplit job response (includes result when completed) */
export type LlamaSplitJob = LlamaCloud.Beta.SplitGetResponse;

/** LlamaSplit job creation params */
export type LlamaSplitParams = LlamaCloud.Beta.SplitCreateParams;

/** LlamaClassify job response */
export type LlamaClassifyJob = LlamaCloud.Classifier.ClassifyJob;

/** LlamaClassify results with per-file predictions */
export type LlamaClassifyResults = LlamaCloud.Classifier.JobGetResultsResponse;

/** LlamaClassify job creation params */
export type LlamaClassifyParams = LlamaCloud.Classifier.JobCreateParams;

/** Classification rule — type name + description */
export type LlamaClassifierRule = LlamaCloud.Classifier.ClassifierRule;
