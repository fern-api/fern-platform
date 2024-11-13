import { ApiDefinition, FernNavigation } from "@fern-api/fdr-sdk";
import { compact, flatten } from "es-toolkit";
import { BaseRecord, EndpointBaseRecord } from "../types";
import { maybePrepareMdxContent } from "./prepare-mdx-content";
import { toDescription } from "./to-description";

interface CreateEndpointBaseRecordOptions {
    node: FernNavigation.EndpointNode;
    base: BaseRecord;
    endpoint: ApiDefinition.EndpointDefinition;
    types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
}

export function createEndpointBaseRecordHttp({
    base,
    node,
    endpoint,
    types,
}: CreateEndpointBaseRecordOptions): EndpointBaseRecord {
    const prepared = maybePrepareMdxContent(toDescription(endpoint.description));
    const code_snippets = flatten(compact([base.code_snippets, prepared.code_snippets]));

    const keywords: string[] = [...(base.keywords ?? [])];

    ApiDefinition.Transformer.with({
        TypeShape: (type) => {
            if (type.type === "alias" && type.value.type === "id") {
                const definition = types[type.value.id];
                if (definition != null) {
                    keywords.push(definition.name);
                }
            }
            return type;
        },
    }).endpoint(endpoint, endpoint.id);

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
        description: prepared.content,
        code_snippets: code_snippets.length > 0 ? code_snippets : undefined,
        availability: endpoint.availability,
        environments: endpoint.environments?.map((environment) => ({
            id: environment.id,
            url: environment.baseUrl,
        })),
        default_environment_id: endpoint.defaultEnvironment,
        keywords: keywords.length > 0 ? keywords : undefined,
    };
}
