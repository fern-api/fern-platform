import { ApiDefinition } from "@fern-api/fdr-sdk";
import { ApiReferenceRecord, EndpointBaseRecord } from "../types.js";
import { toDescription } from "./utils.js";

interface CreateApiReferenceRecordHttpOptions {
    endpointBase: EndpointBaseRecord;
    endpoint: ApiDefinition.EndpointDefinition;
}

export function createApiReferenceRecordHttp({
    endpointBase,
    endpoint,
}: CreateApiReferenceRecordHttpOptions): ApiReferenceRecord {
    return {
        ...endpointBase,
        type: "api-reference",
        request_description: toDescription(endpoint.request?.description),
        response_description: toDescription(endpoint.response?.description),
    };
}
