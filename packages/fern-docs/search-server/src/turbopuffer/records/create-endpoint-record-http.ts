import { ApiDefinition, FernNavigation } from "@fern-api/fdr-sdk";
import { truncateToBytes, withDefaultProtocol } from "@fern-api/ui-core-utils";
import { createHash } from "crypto";
import { compact, flatten } from "es-toolkit/array";
import { maybePrepareMdxContent } from "../../utils/prepare-mdx-content";
import { toDescription } from "../../utils/to-description";
import {
  FernTurbopufferRecord,
  FernTurbopufferRecordWithoutVector,
} from "../types";

interface CreateEndpointBaseRecordOptions {
  node: FernNavigation.EndpointNode;
  base: Omit<FernTurbopufferRecordWithoutVector, "attributes"> & {
    attributes: Omit<FernTurbopufferRecordWithoutVector["attributes"], "chunk">;
  };
  endpoint: ApiDefinition.EndpointDefinition;
  types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
}

export function createEndpointBaseRecordHttp({
  base,
  node,
  endpoint,
  types,
}: CreateEndpointBaseRecordOptions): FernTurbopufferRecord {
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

  const keywords: string[] = [...(base.attributes.keywords ?? [])];

  keywords.push("endpoint", "api", "http", "rest", "openapi");

  const response_type =
    endpoint.responses?.[0]?.body.type === "streamingText" ||
    endpoint.responses?.[0]?.body.type === "stream"
      ? "stream"
      : endpoint.responses?.[0]?.body.type === "fileDownload"
        ? "file"
        : endpoint.responses?.[0]?.body != null
          ? "json"
          : undefined;

  if (response_type != null) {
    keywords.push(response_type);
  }

  // TODO: optimize keywords
  const keywords_as_string = keywords.join(" ");

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

  const endpoint_path = ApiDefinition.toColonEndpointPathLiteral(endpoint.path);
  const endpoint_path_curly = ApiDefinition.toCurlyBraceEndpointPathLiteral(
    endpoint.path
  );

  return {
    ...base,
    id: createHash("sha256").update(node.endpointId).digest("hex"),
    attributes: {
      ...base.attributes,
      chunk: prepared.content?.slice(0, 50) ?? "",
      api_type: "http",
      api_definition_id: node.apiDefinitionId,
      api_endpoint_id: node.endpointId,
      method: node.method,
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
      response_type,
      // TODO: chunk this
      description:
        prepared.content != null
          ? truncateToBytes(prepared.content, 50 * 1000)
          : undefined,
      code_snippets: code_snippets.length > 0 ? code_snippets : undefined,
      availability: endpoint.availability,
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
