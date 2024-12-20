import { FernDefinition } from "@fern-fern/docs-parsers-fern-definition";

export function isExampleCodeSampleSchemaLanguage(
    input: unknown,
): input is FernDefinition.ExampleCodeSampleSchemaLanguage {
    return typeof input === "object" && input != null && "language" in input;
}
