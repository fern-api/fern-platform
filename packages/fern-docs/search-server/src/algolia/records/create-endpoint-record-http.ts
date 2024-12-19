import { ApiDefinition, FernNavigation } from "@fern-api/fdr-sdk";
import {
    measureBytes,
    truncateToBytes,
    withDefaultProtocol,
} from "@fern-api/ui-core-utils";
import { compact, flatten } from "es-toolkit/array";
import { maybePrepareMdxContent } from "../../utils/prepare-mdx-content";
import { toDescription } from "../../utils/to-description";
import { BaseRecord, EndpointBaseRecord } from "../types";

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
    const prepared = maybePrepareMdxContent(
        toDescription(endpoint.description)
    );
    const code_snippets = flatten(
        compact([base.code_snippets, prepared.code_snippets])
    ).filter((codeSnippet) => measureBytes(codeSnippet.code) < 2000);

    const keywords: string[] = [...(base.keywords ?? [])];

    keywords.push("endpoint", "api", "http", "rest", "openapi");

    const response_type =
        endpoint.response?.body.type === "streamingText" ||
        endpoint.response?.body.type === "stream"
            ? "stream"
            : endpoint.response?.body.type === "fileDownload"
              ? "file"
              : endpoint.response?.body != null
                ? "json"
                : undefined;

    if (response_type != null) {
        keywords.push(response_type);
    }

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

    const endpoint_path = ApiDefinition.toColonEndpointPathLiteral(
        endpoint.path
    );
    const endpoint_path_curly = ApiDefinition.toCurlyBraceEndpointPathLiteral(
        endpoint.path
    );

    return {
        ...base,
        api_type: "http",
        api_definition_id: node.apiDefinitionId,
        api_endpoint_id: node.endpointId,
        method: node.method,
        endpoint_path,
        endpoint_path_alternates: [
            endpoint_path_curly,
            ...(endpoint.environments?.map((environment) =>
                String(
                    new URL(
                        endpoint_path,
                        withDefaultProtocol(environment.baseUrl)
                    )
                )
            ) ?? []),
            ...(endpoint.environments?.map((environment) =>
                String(
                    new URL(
                        endpoint_path_curly,
                        withDefaultProtocol(environment.baseUrl)
                    )
                )
            ) ?? []),
        ],
        response_type,
        // TODO: chunk this
        description:
            prepared.content != null
                ? truncateToBytes(prepared.content, 50 * 1000)
                : undefined,
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
