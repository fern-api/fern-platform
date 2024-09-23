import { APIV1UI } from "../client/types";

export function isStreamEndpoint(endpoint: APIV1UI.EndpointDefinition): boolean {
    return endpoint.response?.body.type === "stream" || endpoint.response?.body.type === "streamingText";
}
