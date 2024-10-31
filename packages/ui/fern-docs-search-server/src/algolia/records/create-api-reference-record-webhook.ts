import { ApiDefinition } from "@fern-api/fdr-sdk";
import { compact, flatten } from "es-toolkit";
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
}: CreateApiReferenceRecordWebhookOptions): ApiReferenceRecord {
    const { content: payload_description, code_snippets: payload_description_code_snippets } = maybePrepareMdxContent(
        toDescription(endpoint.payload?.description),
    );
    const code_snippets = flatten(compact([endpointBase.code_snippets, payload_description_code_snippets]));
    return {
        ...endpointBase,
        type: "api-reference",
        payload_description,
        code_snippets: code_snippets.length > 0 ? code_snippets : undefined,
    };
}
