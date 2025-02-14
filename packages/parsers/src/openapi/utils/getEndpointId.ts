import { camelCase } from "es-toolkit";
import { maybeSingleValueToArray } from "./maybeSingleValueToArray";

export function getEndpointId({
  namespace,
  path,
  method,
  sdkMethodName,
  operationId,
  isWebhook,
}: {
  namespace: string | string[] | undefined;
  path: string | undefined;
  method: string | undefined;
  sdkMethodName: string | undefined;
  operationId: string | undefined;
  isWebhook: boolean | undefined;
}): string | undefined {
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
  return `${getPrefix(isWebhook)}${getFullyQualifiedNamespace(namespace)}.${getEndpointName(sdkMethodName, operationId, endpointName)}`;
}

function getPrefix(isWebhook: boolean | undefined): string {
  return isWebhook ? "webhook_" : "endpoint_";
}

function getFullyQualifiedNamespace(
  namespace: string | string[] | undefined
): string | undefined {
  return namespace != null
    ? maybeSingleValueToArray(namespace)
        ?.map((member) => camelCase(member))
        .join(".")
    : "";
}

function getEndpointName(
  sdkMethodName: string | undefined,
  operationId: string | undefined,
  endpointName: string
): string | undefined {
  return (
    camelCase(sdkMethodName ?? "") || operationId || camelCase(endpointName)
  );
}
