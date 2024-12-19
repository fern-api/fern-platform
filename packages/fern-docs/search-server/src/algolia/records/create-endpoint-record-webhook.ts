import { ApiDefinition, FernNavigation } from "@fern-api/fdr-sdk";
import { measureBytes, truncateToBytes } from "@fern-api/ui-core-utils";
import { compact, flatten } from "es-toolkit/array";
import { maybePrepareMdxContent } from "../../utils/prepare-mdx-content";
import { toDescription } from "../../utils/to-description";
import { BaseRecord, EndpointBaseRecord } from "../types";

interface CreateWebhookEndpointBaseRecordOptions {
  node: FernNavigation.WebhookNode;
  base: BaseRecord;
  endpoint: ApiDefinition.WebhookDefinition;
  types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
}

export function createEndpointBaseRecordWebhook({
  base,
  node,
  endpoint,
  types,
}: CreateWebhookEndpointBaseRecordOptions): EndpointBaseRecord {
  const prepared = maybePrepareMdxContent(toDescription(endpoint.description));
  const code_snippets = flatten(
    compact([base.code_snippets, prepared.code_snippets])
  ).filter((codeSnippet) => measureBytes(codeSnippet.code) < 2000);

  const keywords: string[] = [...(base.keywords ?? [])];

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

  return {
    ...base,
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
    keywords: keywords.length > 0 ? keywords : undefined,
  };
}
