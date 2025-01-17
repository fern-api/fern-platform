import type * as Hast from "hast";
import type * as Mdast from "mdast";
import type { MdxJsxElement, MdxJsxElementHast } from "../declarations";

export function isMdxJsxElement(node: Mdast.Node): node is MdxJsxElement {
  return node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement";
}

export function isMdxJsxElementHast(
  node: Hast.Node
): node is MdxJsxElementHast {
  return node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement";
}
