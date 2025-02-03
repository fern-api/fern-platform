import { GLOBAL_EXAMPLE_NAME } from "../3.1/paths/ExampleObjectConverter.node";

export function matchExampleName(
  exampleName: string | symbol,
  requestExampleName: string | symbol
): boolean {
  return (
    exampleName === requestExampleName ||
    requestExampleName === GLOBAL_EXAMPLE_NAME ||
    exampleName === GLOBAL_EXAMPLE_NAME
  );
}
