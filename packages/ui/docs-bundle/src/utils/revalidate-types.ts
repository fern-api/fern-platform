import { FernRevalidation } from "@fern-fern/revalidation-sdk";

export type RevalidatePathResult = FernRevalidation.SuccessfulRevalidation | FernRevalidation.FailedRevalidation;

export function isSuccessResult(result: RevalidatePathResult): result is FernRevalidation.SuccessfulRevalidation {
    return result.success;
}

export function isFailureResult(result: RevalidatePathResult): result is FernRevalidation.FailedRevalidation {
    return !result.success;
}
