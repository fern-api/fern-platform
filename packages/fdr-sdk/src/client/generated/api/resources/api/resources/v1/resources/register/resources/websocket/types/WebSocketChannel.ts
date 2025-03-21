/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as FernRegistry from "../../../../../../../../../index";

export interface WebSocketChannel extends FernRegistry.api.v1.WithDescription, FernRegistry.api.v1.WithAvailability {
    id: FernRegistry.WebSocketId;
    auth: boolean;
    name: string | undefined;
    defaultEnvironment: FernRegistry.EnvironmentId | undefined;
    environments: FernRegistry.api.v1.Environment[];
    path: FernRegistry.api.v1.register.EndpointPath;
    headers: FernRegistry.api.v1.register.Header[];
    queryParameters: FernRegistry.api.v1.register.QueryParameter[];
    /** The messages that can be sent and received on this channel */
    messages: FernRegistry.api.v1.register.WebSocketMessage[];
    examples: FernRegistry.api.v1.register.ExampleWebSocketSession[];
}
