import { OpenAPIV3_1 } from "openapi-types";
import { resolveReference } from "./resolveReference";

export function resolveRequestReference(
  referenceObject: OpenAPIV3_1.ReferenceObject,
  document: OpenAPIV3_1.Document
): OpenAPIV3_1.RequestBodyObject | undefined {
  return resolveReference<OpenAPIV3_1.RequestBodyObject | undefined>(
    referenceObject,
    document,
    undefined
  );
}
