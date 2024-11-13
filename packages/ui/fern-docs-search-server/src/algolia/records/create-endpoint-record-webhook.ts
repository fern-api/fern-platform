import { ApiDefinition, FernNavigation } from "@fern-api/fdr-sdk";
import { compact, flatten } from "es-toolkit";
import { BaseRecord, EndpointBaseRecord } from "../types";
import { maybePrepareMdxContent } from "./prepare-mdx-content";
import { toDescription } from "./to-description";

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
    }).webhookDefinition(endpoint, endpoint.id);

    return {
        ...base,
        api_type: "webhook",
        api_definition_id: node.apiDefinitionId,
        api_endpoint_id: node.webhookId,
        method: node.method,
        endpoint_path: endpoint.path.join(""),
        description: prepared.content,
        code_snippets: code_snippets.length > 0 ? code_snippets : undefined,
        availability: endpoint.availability,
        keywords: keywords.length > 0 ? keywords : undefined,
    };
}
