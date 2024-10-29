import { ApiDefinition } from "@fern-api/fdr-sdk";
import { compact, flatten } from "es-toolkit";
import { ApiReferenceRecord, EndpointBaseRecord } from "../types.js";
import { maybePrepareMdxContent } from "./prepare-mdx-content.js";
import { toDescription } from "./utils.js";

interface CreateApiReferenceRecordHttpOptions {
    endpointBase: EndpointBaseRecord;
    endpoint: ApiDefinition.EndpointDefinition;
}

export function createApiReferenceRecordHttp({
    endpointBase,
    endpoint,
}: CreateApiReferenceRecordHttpOptions): ApiReferenceRecord {
    const { content: request_description, code_snippets: request_description_code_snippets } = maybePrepareMdxContent(
        toDescription(endpoint.request?.description),
    );
    const { content: response_description, code_snippets: response_description_code_snippets } = maybePrepareMdxContent(
        toDescription(endpoint.response?.description),
    );
    const code_snippets = flatten(
        compact([endpointBase.code_snippets, request_description_code_snippets, response_description_code_snippets]),
    );
    return {
        ...endpointBase,
        type: "api-reference",
        request_description,
        response_description,
        code_snippets: code_snippets.length > 0 ? code_snippets : undefined,
    };
}
