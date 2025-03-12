import { FernTurbopufferRecord } from "../types";

interface CreateApiReferenceRecordWebSocketOptions {
  endpointBase: FernTurbopufferRecord;
}

export function createApiReferenceRecordWebSocket({
  endpointBase,
}: CreateApiReferenceRecordWebSocketOptions): FernTurbopufferRecord {
  return {
    ...endpointBase,
    attributes: {
      ...endpointBase.attributes,
      type: "api-reference",
    },
  };
}
