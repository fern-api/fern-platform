import { ApiDefinition } from "@fern-api/fdr-sdk";
import { ApiReferenceRecord, EndpointBaseRecord } from "../types.js";
import { toDescription } from "./utils.js";

interface CreateApiReferenceRecordWebhookOptions {
    endpointBase: EndpointBaseRecord;
    endpoint: ApiDefinition.WebhookDefinition;
}

export function createApiReferenceRecordWebhook({
    endpointBase,
    endpoint,
}: CreateApiReferenceRecordWebhookOptions): ApiReferenceRecord {
    return {
        ...endpointBase,
        type: "api-reference",
        payload_description: toDescription(endpoint.payload?.description),
    };
}
