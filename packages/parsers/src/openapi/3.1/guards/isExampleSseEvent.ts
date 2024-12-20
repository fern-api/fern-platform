import { FernDefinition } from "@fern-fern/docs-parsers-fern-definition";

<<<<<<< HEAD
export function isExampleSseEvent(input: unknown): input is FernDefinition.ExampleSseEventSchema {
    return typeof input === "object" && input != null && "event" in input;
=======
export function isExampleSseEvent(
  input: unknown
): input is FernDefinition.ExampleSseEventSchema {
  return typeof input === "object" && input != null && "event" in input;
>>>>>>> main
}
