import { ApiDefinition } from "@fern-api/fdr-sdk";
import { compact, flatten } from "es-toolkit";
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
        /**
         * This collects code snippets found inside of the request and response descriptions in markdown, but not code snippets for endpoint examples.
         * We probably do want to add those code snippets, but we don't want to over-pollute the records with them because they tend to have redundant information,
         * since it could reduce the quality of the search results, or make it harder to control the size of the records.
         * In the future, we can create separate records for those snippets, so that examples in the api reference can be deeplinked.
         */
        code_snippets: code_snippets.length > 0 ? code_snippets : undefined,
    };
}
