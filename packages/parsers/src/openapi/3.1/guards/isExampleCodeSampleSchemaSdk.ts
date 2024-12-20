import { FernDefinition } from "@fern-fern/docs-parsers-fern-definition";

<<<<<<< HEAD
export function isExampleCodeSampleSchemaSdk(input: unknown): input is FernDefinition.ExampleCodeSampleSchemaSdk {
    return typeof input === "object" && input != null && "sdk" in input;
=======
export function isExampleCodeSampleSchemaSdk(
  input: unknown
): input is FernDefinition.ExampleCodeSampleSchemaSdk {
  return typeof input === "object" && input != null && "sdk" in input;
>>>>>>> main
}
