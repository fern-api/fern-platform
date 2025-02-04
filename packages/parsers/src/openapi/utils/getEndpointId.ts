import { camelCase } from "es-toolkit";

export function getEndpointId(
  namespace: string | string[] | undefined,
  path: string | undefined,
  method: string | undefined,
  sdkMethodName: string | undefined,
  operationId: string | undefined
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
  return `endpoint_${camelCase(namespace != null ? (typeof namespace === "string" ? namespace : namespace.join("_")) : "")}.${camelCase(sdkMethodName ?? "") || operationId || camelCase(endpointName)}`;
}
