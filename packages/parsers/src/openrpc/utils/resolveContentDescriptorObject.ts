import {
  ContentDescriptorObject,
  OpenrpcDocument,
  ReferenceObject,
} from "@open-rpc/meta-schema";
import { isReferenceObject } from "./isReferenceObject";
import { resolveReference } from "./resolveReference";

export function resolveContentDescriptorObject(
  contentDescriptor: ContentDescriptorObject | ReferenceObject | undefined,
  document: OpenrpcDocument
): ContentDescriptorObject | undefined {
  if (isReferenceObject(contentDescriptor)) {
    return resolveReference<ContentDescriptorObject>(
      contentDescriptor,
      document,
      { name: "", schema: { type: "object" } }
    );
  }
  return contentDescriptor;
}
