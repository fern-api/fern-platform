import {
  MethodObject,
  OpenrpcDocument,
  ReferenceObject,
} from "@open-rpc/meta-schema";

import { isReferenceObject } from "./isReferenceObject";
import { resolveReference } from "./resolveReference";

export function resolveMethodReference(
  method: MethodObject | ReferenceObject | undefined,
  document: OpenrpcDocument
): MethodObject | undefined {
  if (isReferenceObject(method)) {
    return resolveReference<MethodObject>(method, document, {
      name: "",
      params: [],
      result: { name: "", schema: { type: "object" } },
    });
  }
  return method;
}
