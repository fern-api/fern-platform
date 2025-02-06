import { OpenAPIV3_1 } from "openapi-types";
import { isReferenceObject } from "../../3.1/guards/isReferenceObject";
import { resolveReference } from "./resolveReference";

export function resolveParameterReference(
  referenceObject: OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.ParameterObject,
  document: OpenAPIV3_1.Document
): OpenAPIV3_1.ParameterObject | undefined {
  if (isReferenceObject(referenceObject)) {
    return resolveReference<OpenAPIV3_1.ParameterObject | undefined>(
      referenceObject,
      document,
      undefined
    );
  }
  return referenceObject;
}
