import { camelCase } from "es-toolkit";

export function getEndpointId(
<<<<<<< HEAD
    namespace: string | string[] | undefined,
    path: string | undefined,
    sdkMethodName: string | undefined,
    operationId: string | undefined,
): string | undefined {
    if (path == null) {
        return undefined;
    }
    const endpointName = path.split("/").at(-1);
    if (endpointName == null) {
        return undefined;
    }
    return `endpoint_${camelCase(namespace != null ? (typeof namespace === "string" ? namespace : namespace.join("_")) : "")}.${camelCase(sdkMethodName ?? "") || operationId || camelCase(endpointName)}`;
=======
  namespace: string | string[] | undefined,
  path: string | undefined,
  sdkMethodName: string | undefined,
  operationId: string | undefined
): string | undefined {
  if (path == null) {
    return undefined;
  }
  const endpointName = path.split("/").at(-1);
  if (endpointName == null) {
    return undefined;
  }
  return `endpoint_${camelCase(namespace != null ? (typeof namespace === "string" ? namespace : namespace.join("_")) : "")}.${camelCase(sdkMethodName ?? "") || operationId || camelCase(endpointName)}`;
>>>>>>> main
}
