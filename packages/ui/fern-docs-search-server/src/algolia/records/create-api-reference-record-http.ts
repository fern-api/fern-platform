import { ApiDefinition } from "@fern-api/fdr-sdk";
import { truncateToBytes } from "@fern-api/ui-core-utils";
import { ApiReferenceRecord, EndpointBaseRecord } from "../types";
import { maybePrepareMdxContent } from "./prepare-mdx-content";
import { toDescription } from "./to-description";

interface CreateApiReferenceRecordHttpOptions {
    endpointBase: EndpointBaseRecord;
    endpoint: ApiDefinition.EndpointDefinition;
}

export function createApiReferenceRecordHttp({
    endpointBase,
    endpoint,
}: CreateApiReferenceRecordHttpOptions): ApiReferenceRecord[] {
    const base: ApiReferenceRecord = {
        ...endpointBase,
        type: "api-reference",
    };

    const records: ApiReferenceRecord[] = [base];
    const { content: request_description, code_snippets: request_description_code_snippets } = maybePrepareMdxContent(
        toDescription(endpoint.request?.description),
    );

    if (request_description != null || request_description_code_snippets?.length) {
        records.push({
            ...base,
            objectID: `${base.objectID}-request`,
            hash: "#request",
            // TODO: chunk this
            description: request_description != null ? truncateToBytes(request_description, 50 * 1000) : undefined,
            code_snippets: request_description_code_snippets,
        });
    }

    const { content: response_description, code_snippets: response_description_code_snippets } = maybePrepareMdxContent(
        toDescription(endpoint.response?.description),
    );

    if (response_description != null || response_description_code_snippets?.length) {
        records.push({
            ...base,
            objectID: `${base.objectID}-response`,
            hash: "#response",
            // TODO: chunk this
            description: response_description != null ? truncateToBytes(response_description, 50 * 1000) : undefined,
            code_snippets: response_description_code_snippets,
        });
    }

    return records;
}
