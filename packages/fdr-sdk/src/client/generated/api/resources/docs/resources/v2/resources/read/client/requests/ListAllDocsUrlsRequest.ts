/**
 * This file was auto-generated by Fern from our API Definition.
 */

/**
 * @example
 *     {}
 */
export interface ListAllDocsUrlsRequest {
    page?: number;
    limit?: number;
    /**
     * If true, filters to only docs with a custom URL.
     */
    custom?: boolean;
}
