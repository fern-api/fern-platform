import { ApiDefinition, FernNavigation } from "@fern-api/fdr-sdk";
import { compact, flatten } from "es-toolkit";
import { BaseRecord, EndpointBaseRecord } from "../types";
import { maybePrepareMdxContent } from "./prepare-mdx-content";
import { toDescription } from "./to-description";

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
    const prepared = maybePrepareMdxContent(toDescription(endpoint.description));
    const code_snippets = flatten(compact([base.code_snippets, prepared.code_snippets]));
    return {
        ...base,
        api_type: "websocket",
        api_definition_id: node.apiDefinitionId,
        api_endpoint_id: node.webSocketId,
        method: "GET",
        description: prepared.content,
        code_snippets: code_snippets.length > 0 ? code_snippets : undefined,
        availability: endpoint.availability,
        endpoint_path: endpoint.path.join(""),
        environments: endpoint.environments?.map((environment) => ({
            id: environment.id,
            url: environment.baseUrl,
        })),
        default_environment_id: endpoint.defaultEnvironment,
    };
}
