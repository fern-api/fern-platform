/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as FernRegistry from "../../../../../index";
export interface EndpointPairNode extends FernRegistry.navigation.latest.WithNodeId {
    type: "endpointPair";
    stream: FernRegistry.navigation.latest.EndpointNode;
    nonStream: FernRegistry.navigation.latest.EndpointNode;
}