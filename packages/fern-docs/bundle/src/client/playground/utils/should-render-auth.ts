import { ApiDefinition } from "@fern-api/fdr-sdk";

export function shouldRenderAuth(
  endpoint: ApiDefinition.EndpointDefinition,
  auth: ApiDefinition.AuthScheme
): boolean {
  if (
    auth.type === "oAuth" &&
    auth.value.type === "clientCredentials" &&
    auth.value.value.type === "referencedEndpoint"
  ) {
    if (auth.value.value.endpointId === endpoint.id) {
      return false;
    }
  }
  return true;
}
