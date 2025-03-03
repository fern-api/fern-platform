import { camelCase } from "es-toolkit/compat";
import { maybeSingleValueToArray } from "./maybeSingleValueToArray";

export function getEndpointId({
  namespace,
  path,
  method,
  sdkMethodName,
  operationId,
  displayName,
  isWebhook,
}: {
  namespace: string | string[] | undefined;
  path: string | undefined;
  method: string | undefined;
  sdkMethodName: string | undefined;
  operationId: string | undefined;
  displayName: string | undefined;
  isWebhook: boolean | undefined;
}): string | undefined {
  if (path == null) {
    return undefined;
  }
  const endpointFallbackName =
    method != null && path != null
      ? `${method}_${path.split("/").join("_")}`
      : method != null
        ? method
        : path.split("/").join("_");

  if (
    sdkMethodName == null &&
    operationId == null &&
    displayName == null &&
    endpointFallbackName == null
  ) {
    return undefined;
  }

  return `${getPrefix(isWebhook)}${getFullyQualifiedNamespace(namespace)}.${getEndpointName(sdkMethodName, operationId, displayName, endpointFallbackName)}`;
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
        .join("/")
    : "";
}

function getEndpointName(
  sdkMethodName: string | undefined,
  operationId: string | undefined,
  displayName: string | undefined,
  fallbackName: string | undefined
): string | undefined {
  return (
    sdkMethodName ||
    operationId ||
    camelCase(displayName ?? "") ||
    camelCase(fallbackName ?? "")
  );
}
