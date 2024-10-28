import { ApiDefinition, FernNavigation } from "@fern-api/fdr-sdk";
import { BaseRecord, EndpointBaseRecord } from "../types.js";
import { toDescription } from "./utils.js";

interface CreateWebSocketEndpointBaseRecordOptions {
    node: FernNavigation.WebSocketNode;
    base: BaseRecord;
    endpoint: ApiDefinition.WebSocketChannel;
}

export function createEndpointBaseRecordWebSocket({
    base,
    node,
    endpoint,
}: CreateWebSocketEndpointBaseRecordOptions): EndpointBaseRecord {
    return {
        ...base,
        api_type: "websocket",
        api_definition_id: node.apiDefinitionId,
        api_endpoint_id: node.webSocketId,
        method: "GET",
        description: toDescription(endpoint.description),
        availability: endpoint.availability,
        endpoint_path: endpoint.path.join(""),
        environments: endpoint.environments?.map((environment) => ({
            id: environment.id,
            url: environment.baseUrl,
        })),
        default_environment_id: endpoint.defaultEnvironment,
    };
}
