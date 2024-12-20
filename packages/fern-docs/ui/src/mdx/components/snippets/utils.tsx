import { APIV1Read } from "@fern-api/fdr-sdk/client/types";

export function extractEndpointPathAndMethod(
  endpoint: string
): [APIV1Read.HttpMethod | undefined, string | undefined] {
  const [maybeMethod, path] = endpoint.split(" ");

  // parse method into APIV1Read.HttpMethod
  let method: APIV1Read.HttpMethod | undefined;

  if (maybeMethod != null) {
    method = maybeMethod.toUpperCase() as APIV1Read.HttpMethod;
  }

  // ensure that method is a valid HTTP method
  if (method == null || !Object.values(APIV1Read.HttpMethod).includes(method)) {
    return [undefined, undefined];
  }

  return [method, path];
}
