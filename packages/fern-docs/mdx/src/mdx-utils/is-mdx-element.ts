import { isPlainObject } from "@fern-api/ui-core-utils";
import type { MdxJsxElement, MdxJsxElementHast } from "../declarations";

export function isMdxJsxElement(node: unknown): node is MdxJsxElement {
  if (isPlainObject(node) && typeof node.type === "string") {
    return (
      (node.type === "mdxJsxFlowElement" ||
        node.type === "mdxJsxTextElement") &&
      Array.isArray(node.children) &&
      Array.isArray(node.attributes)
    );
  }
  return false;
}

export function isMdxJsxElementHast(node: unknown): node is MdxJsxElementHast {
  // return node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement";
  if (isPlainObject(node) && typeof node.type === "string") {
    return (
      (node.type === "mdxJsxFlowElement" ||
        node.type === "mdxJsxTextElement") &&
      Array.isArray(node.children) &&
      Array.isArray(node.attributes)
    );
  }
  return false;
}
