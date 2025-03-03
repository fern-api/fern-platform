/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as FernRegistry from "../../../../../index";

export interface EndpointNode
    extends FernRegistry.navigation.v1.WithNodeMetadata,
        FernRegistry.navigation.v1.WithApiDefinitionId {
    type: "endpoint";
    method: FernRegistry.HttpMethod;
    endpointId: FernRegistry.EndpointId;
    isResponseStream: boolean | undefined;
    /** Settings for the api playground that affect this endpoint specifically. */
    playground: FernRegistry.navigation.v1.PlaygroundSettings | undefined;
}
