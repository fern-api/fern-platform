import {
  ExampleObject,
  OpenrpcDocument,
  ReferenceObject,
} from "@open-rpc/meta-schema";
import { isReferenceObject } from "./isReferenceObject";
import { resolveReference } from "./resolveReference";

export function resolveExample(
  example: ExampleObject | ReferenceObject | undefined,
  document: OpenrpcDocument
): ExampleObject | undefined {
  if (isReferenceObject(example)) {
    return resolveReference<ExampleObject | undefined>(
      example,
      document,
      undefined
    );
  }
  return example;
}
