import type { Root } from "mdast";
import { visit } from "unist-util-visit";

/**
 * Removes empty paragraphs
 */
export function remarkSqueezeParagraphs(): (tree: Root) => void {
  return function (tree: Root): void {
    visit(tree, (node, index, parent) => {
      if (index == null || parent == null) {
        return;
      }
      if (node.type === "paragraph") {
        if (
          node.children.every(function (child) {
            return child.type === "text" && /^\s*$/.test(child.value);
          })
        ) {
          parent.children.splice(index, 1);
          return index;
        }
      }
      return;
    });
  };
}
