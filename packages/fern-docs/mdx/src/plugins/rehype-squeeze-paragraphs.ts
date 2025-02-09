import type { Doctype, Element, ElementContent, Root } from "hast";
import { MdxjsEsmHast } from "mdast-util-mdxjs-esm";
import { visit } from "unist-util-visit";
import { isMdxJsxElementHast } from "../mdx-utils/is-mdx-element";

function isParagraphElement(
  node: ElementContent | Root | Doctype | MdxjsEsmHast
): node is Element {
  return (
    (node.type === "element" && node.tagName === "p") ||
    (isMdxJsxElementHast(node) && node.name === "p")
  );
}

/**
 * Removes <p> tags that are nested inside <p> tags
 */
export function rehypeSqueezeParagraphs({
  stripParagraph = false,
}: {
  stripParagraph?: boolean;
} = {}): (tree: Root) => void {
  return function (tree: Root): void {
    visit(tree, (node, index, parent) => {
      if (index == null || parent == null) {
        return;
      }
      if (
        isParagraphElement(node) &&
        (isParagraphElement(parent) || stripParagraph)
      ) {
        parent.children.splice(index, 1, ...node.children);
        return index;
      }
      return;
    });
  };
}
