import {
  OpenrpcDocument,
  ReferenceObject,
  TagObject,
} from "@open-rpc/meta-schema";

import { isReferenceObject } from "./isReferenceObject";
import { resolveReference } from "./resolveReference";

export function resolveTag(
  tag: TagObject | ReferenceObject | undefined,
  document: OpenrpcDocument
): TagObject | undefined {
  if (isReferenceObject(tag)) {
    return resolveReference<TagObject | undefined>(tag, document, undefined);
  }
  return tag;
}
