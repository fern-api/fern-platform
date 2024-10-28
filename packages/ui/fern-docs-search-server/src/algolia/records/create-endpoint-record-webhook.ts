import { ApiDefinition, FernNavigation } from "@fern-api/fdr-sdk";
import { BaseRecord, EndpointBaseRecord } from "../types.js";
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
    return {
        ...base,
        api_type: "webhook",
        api_definition_id: node.apiDefinitionId,
        api_endpoint_id: node.webhookId,
        method: node.method,
        endpoint_path: endpoint.path.join(""),
        description: toDescription(endpoint.description),
        availability: endpoint.availability,
    };
}
