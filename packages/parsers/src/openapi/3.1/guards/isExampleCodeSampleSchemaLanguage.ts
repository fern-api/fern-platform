import { FernDefinition } from "@fern-fern/docs-parsers-fern-definition";

export function isExampleCodeSampleSchemaLanguage(
<<<<<<< HEAD
    input: unknown,
): input is FernDefinition.ExampleCodeSampleSchemaLanguage {
    return typeof input === "object" && input != null && "language" in input;
=======
  input: unknown
): input is FernDefinition.ExampleCodeSampleSchemaLanguage {
  return typeof input === "object" && input != null && "language" in input;
>>>>>>> main
}
