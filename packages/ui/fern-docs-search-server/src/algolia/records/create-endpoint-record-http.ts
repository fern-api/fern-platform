import { ApiDefinition, FernNavigation } from "@fern-api/fdr-sdk";
import { BaseRecord, EndpointBaseRecord } from "../types.js";
import { toDescription } from "./utils.js";

interface CreateEndpointBaseRecordOptions {
    node: FernNavigation.EndpointNode;
    base: BaseRecord;
    endpoint: ApiDefinition.EndpointDefinition;
}

export function createEndpointBaseRecordHttp({
    base,
    node,
    endpoint,
}: CreateEndpointBaseRecordOptions): EndpointBaseRecord {
    return {
        ...base,
        api_type: "http",
        api_definition_id: node.apiDefinitionId,
        api_endpoint_id: node.endpointId,
        method: node.method,
        endpoint_path: ApiDefinition.toColonEndpointPathLiteral(endpoint.path),
        response_type:
            endpoint.response?.body.type === "streamingText" || endpoint.response?.body.type === "stream"
                ? "stream"
                : undefined,
        description: toDescription(endpoint.description),
        availability: endpoint.availability,
        environments: endpoint.environments?.map((environment) => ({
            id: environment.id,
            url: environment.baseUrl,
        })),
        default_environment_id: endpoint.defaultEnvironment,
    };
}
