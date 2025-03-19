import { createHash } from "crypto";
import { compact, flatten } from "es-toolkit/array";

import { ApiDefinition, FernNavigation } from "@fern-api/fdr-sdk";
import { truncateToBytes, withDefaultProtocol } from "@fern-api/ui-core-utils";

import { maybePrepareMdxContent } from "../../utils/prepare-mdx-content";
import { toDescription } from "../../utils/to-description";
import {
  FernTurbopufferRecord,
  FernTurbopufferRecordWithoutVector,
} from "../types";

interface CreateWebSocketEndpointBaseRecordOptions {
  node: FernNavigation.WebSocketNode;
  base: Omit<FernTurbopufferRecordWithoutVector, "attributes"> & {
    attributes: Omit<FernTurbopufferRecordWithoutVector["attributes"], "chunk">;
  };
  endpoint: ApiDefinition.WebSocketChannel;
  types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
}

export function createEndpointBaseRecordWebSocket({
  base,
  node,
  endpoint,
  types,
}: CreateWebSocketEndpointBaseRecordOptions): FernTurbopufferRecord {
  const prepared = maybePrepareMdxContent(toDescription(endpoint.description));
  const snippets = compact([
    ...(base.attributes.code_snippets ?? []),
    ...(prepared.code_snippets ?? []),
  ]);
  const code_snippets = flatten(
    snippets.map((snippet) => {
      if (typeof snippet === "string") {
        return snippet;
      } else if (typeof snippet === "object") {
        const output: string[] = [];
        if (snippet.lang) {
          output.push(snippet.lang);
        }
        if (snippet.code) {
          output.push(snippet.code);
        }
        if (snippet.meta) {
          output.push(snippet.meta);
        }
        return output;
      }
      return [];
    })
  ).filter((snippet) => snippet != null);

  const keywords: string[] = [];
  if (
    typeof base.attributes.keywords !== "undefined" &&
    typeof base.attributes.keywords === "string"
  ) {
    keywords.push(base.attributes.keywords);
  } else if (
    typeof base.attributes.keywords !== "undefined" &&
    Array.isArray(base.attributes.keywords)
  ) {
    keywords.push(...base.attributes.keywords);
  }

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

  const keywords_as_string = keywords.join(" ");

  const endpoint_path = ApiDefinition.toColonEndpointPathLiteral(endpoint.path);
  const endpoint_path_curly = ApiDefinition.toCurlyBraceEndpointPathLiteral(
    endpoint.path
  );

  return {
    ...base,
    id: createHash("sha256").update(node.webSocketId).digest("hex"),
    attributes: {
      ...base.attributes,
      chunk: prepared.content ?? "",
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
          String(
            new URL(endpoint_path, withDefaultProtocol(environment.baseUrl))
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
      environments: flatten(
        endpoint.environments?.map((environment) => [
          environment.id,
          environment.baseUrl,
        ]) ?? []
      ),
      default_environment_id: endpoint.defaultEnvironment,
      keywords: keywords_as_string,
    },
  };
}
