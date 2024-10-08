import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";

export type EndpointContext = {
    node: FernNavigation.EndpointNode;
    endpoint: ApiDefinition.EndpointDefinition;
    globalHeaders: ApiDefinition.ObjectProperty[];
    auth: ApiDefinition.AuthScheme | undefined;
    types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
};

export function createEndpointContext(
    node: FernNavigation.EndpointNode | undefined,
    api: ApiDefinition.ApiDefinition | undefined,
): EndpointContext | undefined {
    if (!node) {
        return undefined;
    }
    const endpoint = api?.endpoints[node.endpointId];
    if (!endpoint) {
        return undefined;
    }
    return {
        node,
        endpoint,
        auth: endpoint.auth?.map((id) => api.auths[id])[0],
        globalHeaders: api.globalHeaders ?? [],
        types: api.types,
    };
}

export type WebSocketContext = {
    node: FernNavigation.WebSocketNode;
    channel: ApiDefinition.WebSocketChannel;
    globalHeaders: ApiDefinition.ObjectProperty[];
    auth: ApiDefinition.AuthScheme | undefined;
    types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
};

export function createWebSocketContext(
    node: FernNavigation.WebSocketNode | undefined,
    api: ApiDefinition.ApiDefinition | undefined,
): WebSocketContext | undefined {
    if (!node) {
        return undefined;
    }
    const channel = api?.websockets[node.webSocketId];
    if (!channel) {
        return undefined;
    }
    return {
        node,
        channel,
        auth: channel.auth?.map((id) => api.auths[id])[0],
        globalHeaders: api.globalHeaders ?? [],
        types: api.auths,
    };
}
