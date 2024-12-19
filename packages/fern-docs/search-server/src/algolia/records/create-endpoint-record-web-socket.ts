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

interface CreateWebSocketEndpointBaseRecordOptions {
  node: FernNavigation.WebSocketNode;
  base: BaseRecord;
  endpoint: ApiDefinition.WebSocketChannel;
  types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
}

export function createEndpointBaseRecordWebSocket({
  base,
  node,
  endpoint,
  types,
}: CreateWebSocketEndpointBaseRecordOptions): EndpointBaseRecord {
  const prepared = maybePrepareMdxContent(toDescription(endpoint.description));
  const code_snippets = flatten(
    compact([base.code_snippets, prepared.code_snippets])
  ).filter((codeSnippet) => measureBytes(codeSnippet.code) < 2000);

  const keywords: string[] = [...(base.keywords ?? [])];

  keywords.push("endpoint", "api", "websocket", "web socket", "stream");

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
  }).webSocketChannel(endpoint, endpoint.id);

  const endpoint_path = ApiDefinition.toColonEndpointPathLiteral(endpoint.path);
  const endpoint_path_curly = ApiDefinition.toCurlyBraceEndpointPathLiteral(
    endpoint.path
  );

  return {
    ...base,
    api_type: "websocket",
    api_definition_id: node.apiDefinitionId,
    api_endpoint_id: node.webSocketId,
    method: "GET",
    // TODO: chunk this
    description:
      prepared.content != null
        ? truncateToBytes(prepared.content, 50 * 1000)
        : undefined,
    code_snippets: code_snippets.length > 0 ? code_snippets : undefined,
    availability: endpoint.availability,
    endpoint_path,
    endpoint_path_alternates: [
      endpoint_path_curly,
      ...(endpoint.environments?.map((environment) =>
        String(new URL(endpoint_path, withDefaultProtocol(environment.baseUrl)))
      ) ?? []),
      ...(endpoint.environments?.map((environment) =>
        String(
          new URL(endpoint_path_curly, withDefaultProtocol(environment.baseUrl))
        )
      ) ?? []),
    ],
    environments: endpoint.environments?.map((environment) => ({
      id: environment.id,
      url: environment.baseUrl,
    })),
    default_environment_id: endpoint.defaultEnvironment,
    keywords: keywords.length > 0 ? keywords : undefined,
  };
}
