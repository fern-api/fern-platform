import { ApiDefinition, FernNavigation } from "@fern-api/fdr-sdk";
import { compact, flatten } from "es-toolkit";
import { BaseRecord, EndpointBaseRecord } from "../types.js";
import { maybePrepareMdxContent } from "./prepare-mdx-content.js";
import { toDescription } from "./utils.js";

interface CreateWebhookEndpointBaseRecordOptions {
    node: FernNavigation.WebhookNode;
    base: BaseRecord;
    endpoint: ApiDefinition.WebhookDefinition;
}

export function createEndpointBaseRecordWebhook({
    base,
    node,
    endpoint,
}: CreateWebhookEndpointBaseRecordOptions): EndpointBaseRecord {
    const prepared = maybePrepareMdxContent(toDescription(endpoint.description));
    const code_snippets = flatten(compact([base.code_snippets, prepared.code_snippets]));
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
    };
}
