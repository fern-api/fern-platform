import { FernDefinition } from "@fern-fern/docs-parsers-fern-definition";

export function isExampleResponseBody(
  input: unknown
): input is FernDefinition.ExampleBodyResponseSchema {
  return (
    typeof input === "object" &&
    input != null &&
    ("error" in input || "body" in input)
  );
}
