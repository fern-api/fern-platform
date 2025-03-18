import { createHash } from "crypto";
import { compact, flatten } from "es-toolkit/array";

import { ApiDefinition, FernNavigation } from "@fern-api/fdr-sdk";
import { truncateToBytes } from "@fern-api/ui-core-utils";

import { maybePrepareMdxContent } from "../../utils/prepare-mdx-content";
import { toDescription } from "../../utils/to-description";
import {
  FernTurbopufferRecord,
  FernTurbopufferRecordWithoutVector,
} from "../types";

interface CreateWebhookEndpointBaseRecordOptions {
  node: FernNavigation.WebhookNode;
  base: Omit<FernTurbopufferRecordWithoutVector, "attributes"> & {
    attributes: Omit<FernTurbopufferRecordWithoutVector["attributes"], "chunk">;
  };
  endpoint: ApiDefinition.WebhookDefinition;
  types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
}

export function createEndpointBaseRecordWebhook({
  base,
  node,
  endpoint,
  types,
}: CreateWebhookEndpointBaseRecordOptions): FernTurbopufferRecord {
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

  keywords.push("endpoint", "api", "webhook");

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
  }).webhookDefinition(endpoint, endpoint.id);

  const keywords_as_string = keywords.join(" ");

  return {
    ...base,
    id: createHash("sha256").update(node.webhookId).digest("hex"),
    attributes: {
      ...base.attributes,
      chunk: prepared.content?.slice(0, 50) ?? "",
      api_type: "webhook",
      api_definition_id: node.apiDefinitionId,
      api_endpoint_id: node.webhookId,
      method: node.method,
      endpoint_path: endpoint.path.join(""),
      // TODO: chunk this
      description:
        prepared.content != null
          ? truncateToBytes(prepared.content, 50 * 1000)
          : undefined,
      code_snippets: code_snippets.length > 0 ? code_snippets : undefined,
      availability: endpoint.availability,
      keywords: keywords_as_string,
    },
  };
}
