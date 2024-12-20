import { FernDefinition } from "@fern-fern/docs-parsers-fern-definition";
import { isExampleSseEvent } from "./isExampleSseEvent";

<<<<<<< HEAD
export function isExampleSseResponseBody(input: unknown): input is FernDefinition.ExampleSseResponseSchema {
    return (
        typeof input === "object" &&
        input != null &&
        "stream" in input &&
        Array.isArray(input.stream) &&
        input.stream.every(isExampleSseEvent)
    );
=======
export function isExampleSseResponseBody(
  input: unknown
): input is FernDefinition.ExampleSseResponseSchema {
  return (
    typeof input === "object" &&
    input != null &&
    "stream" in input &&
    Array.isArray(input.stream) &&
    input.stream.every(isExampleSseEvent)
  );
>>>>>>> main
}
