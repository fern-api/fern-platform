import {
  ExamplePairingObject,
  OpenrpcDocument,
  ReferenceObject,
} from "@open-rpc/meta-schema";

import { isReferenceObject } from "./isReferenceObject";
import { resolveReference } from "./resolveReference";

export function resolveExamplePairingOrReference(
  examplePairing: ExamplePairingObject | ReferenceObject | undefined,
  document: OpenrpcDocument
): ExamplePairingObject | undefined {
  if (isReferenceObject(examplePairing)) {
    return resolveReference<ExamplePairingObject | undefined>(
      examplePairing,
      document,
      undefined
    );
  }
  return examplePairing;
}
