/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as FernRegistry from "../../../../index";

/**
 * @example
 *     {
 *         page: undefined,
 *         pageSize: undefined,
 *         organizationId: undefined,
 *         repositoryName: undefined,
 *         repositoryOwner: undefined
 *     }
 */
export interface ListRepositoriesRequest {
    /** The page number to retrieve. Defaults to 0. */
    page?: number;
    /** The number of items to retrieve per page. Defaults to 20. */
    pageSize?: number;
    /** The Fern organization ID to filter repositories by. */
    organizationId?: FernRegistry.OrgId;
    /** The name of the repository to filter pull requests by (ex: full-platform). */
    repositoryName?: string;
    /** The organization name of the repository owner to filter pull requests by (ex: fern-api). */
    repositoryOwner?: string;
}
