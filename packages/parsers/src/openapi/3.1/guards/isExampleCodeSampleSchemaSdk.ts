import { FernDefinition } from "@fern-fern/docs-parsers-fern-definition";

export function isExampleCodeSampleSchemaSdk(
  input: unknown
): input is FernDefinition.ExampleCodeSampleSchemaSdk {
  return typeof input === "object" && input != null && "sdk" in input;
}
