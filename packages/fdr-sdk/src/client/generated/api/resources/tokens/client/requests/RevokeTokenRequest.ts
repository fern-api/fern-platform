/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as FernRegistry from "../../../../index";

/**
 * @example
 *     {
 *         orgId: FernRegistry.OrgId("string"),
 *         tokenId: FernRegistry.TokenId("string")
 *     }
 */
export interface RevokeTokenRequest {
    /**
     * The organization to create snippets for.
     *
     */
    orgId: FernRegistry.OrgId;
    tokenId: FernRegistry.TokenId;
}
