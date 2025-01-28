import { FernDefinition } from "@fern-fern/docs-parsers-fern-definition";

export function isExampleStreamResponse(
  input: unknown
): input is FernDefinition.ExampleStreamResponseSchema {
  return (
    typeof input === "object" &&
    input != null &&
    "stream" in input &&
    Array.isArray(input.stream)
  );
}
