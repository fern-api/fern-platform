import { camelCase } from "es-toolkit";
import { maybeSingleValueToArray } from "./maybeSingleValueToArray";

export function getEndpointId(
  namespace: string | string[] | undefined,
  path: string | undefined,
  method: string | undefined,
  sdkMethodName: string | undefined,
  operationId: string | undefined,
  isWebhook: boolean | undefined
): string | undefined {
  if (path == null) {
    return undefined;
  }
  const endpointName =
    method != null && path != null
      ? `${method}/${path}`
      : method != null
        ? method
        : path;
  if (endpointName == null) {
    return undefined;
  }
  return `${isWebhook ? "subpackage_" : "endpoint_"}${
    namespace != null
      ? maybeSingleValueToArray(namespace)
          ?.map((member) => camelCase(member))
          .join(".")
      : ""
  }.${camelCase(sdkMethodName ?? "") || operationId || camelCase(endpointName)}`;
}
