import type { Node as HastNode } from "hast";
import type { Node as MdastNode } from "mdast";
import type { MdxElement, MdxElementHast } from "../declarations.js";

export function isMdxElement(node: MdastNode): node is MdxElement {
    return node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement";
}

export function isMdxElementHast(node: HastNode): node is MdxElementHast {
    return node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement";
}
