import { OpenrpcDocument, ReferenceObject } from "@open-rpc/meta-schema";

import { isReferenceObject } from "./isReferenceObject";

export function resolveReference<Output>(
  referenceObject: ReferenceObject,
  document: OpenrpcDocument,
  defaultOutput: Output
): Output {
  const keys = referenceObject.$ref
    .substring(2)
    .split("/")
    .map((key) => key.replace(/~1/g, "/"));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let resolvedSchema: any = document;
  for (const key of keys) {
    if (typeof resolvedSchema !== "object" || resolvedSchema == null) {
      return defaultOutput;
    }
    resolvedSchema = resolvedSchema[key];
  }
  if (resolvedSchema == null) {
    return defaultOutput;
  }

  // If the result is another reference object, make a recursive call
  if (isReferenceObject(resolvedSchema)) {
    resolvedSchema = resolveReference(resolvedSchema, document, defaultOutput);
  }

  return resolvedSchema;
}
