import type { Node as HastNode } from "hast";
import type { Node as MdastNode } from "mdast";
import type { MdxJsxElement, MdxJsxElementHast } from "../declarations.js";

export function isMdxJsxElement(node: MdastNode): node is MdxJsxElement {
    return node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement";
}

export function isMdxJsxElementHast(node: HastNode): node is MdxJsxElementHast {
    return node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement";
}
