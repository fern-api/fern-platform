/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as FernRegistry from "../../../../index";
export interface ListRepositoriesRequest {
    page?: number;
    pageSize?: number;
    organizationId?: FernRegistry.OrgId;
    repositoryName?: string;
    repositoryOwner?: string;
}
