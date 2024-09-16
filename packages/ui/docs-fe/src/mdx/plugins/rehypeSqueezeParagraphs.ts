import type { Root } from "hast";
import { visit } from "unist-util-visit";

export function rehypeSqueezeParagraphs(): (tree: Root) => void {
    return function (tree: Root): void {
        visit(tree, (node, index, parent) => {
            if (index == null || parent == null) {
                return;
            }
            if (
                node.type === "element" &&
                node.tagName === "p" &&
                parent.type === "mdxJsxFlowElement" &&
                parent.name === "p"
            ) {
                parent.children.splice(index, 1, ...node.children);
                return index;
            }
            return;
        });
    };
}
