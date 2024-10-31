import { ApiReferenceRecord, EndpointBaseRecord } from "../types";

interface CreateApiReferenceRecordWebSocketOptions {
    endpointBase: EndpointBaseRecord;
}

export function createApiReferenceRecordWebSocket({
    endpointBase,
}: CreateApiReferenceRecordWebSocketOptions): ApiReferenceRecord {
    return {
        ...endpointBase,
        type: "api-reference",
    };
}
