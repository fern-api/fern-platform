import { ApiDefinition } from "@fern-api/fdr-sdk";
import { truncateToBytes } from "@fern-api/ui-core-utils";
import { ApiReferenceRecord, EndpointBaseRecord } from "../types";
import { maybePrepareMdxContent } from "./prepare-mdx-content";
import { toDescription } from "./to-description";

interface CreateApiReferenceRecordWebhookOptions {
    endpointBase: EndpointBaseRecord;
    endpoint: ApiDefinition.WebhookDefinition;
}

export function createApiReferenceRecordWebhook({
    endpointBase,
    endpoint,
}: CreateApiReferenceRecordWebhookOptions): ApiReferenceRecord[] {
    const base: ApiReferenceRecord = {
        ...endpointBase,
        type: "api-reference",
    };

    const records: ApiReferenceRecord[] = [base];

    const { content: payload_description, code_snippets: payload_description_code_snippets } = maybePrepareMdxContent(
        toDescription(endpoint.payload?.description),
    );

    if (payload_description != null || payload_description_code_snippets?.length) {
        records.push({
            ...base,
            objectID: `${base.objectID}-payload`,
            hash: "#payload",
            description: payload_description != null ? truncateToBytes(payload_description, 50 * 1000) : undefined,
            code_snippets: payload_description_code_snippets,
        });
    }

    return records;
}
