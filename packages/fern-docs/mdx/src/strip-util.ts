import { visit } from "unist-util-visit";

import { hastToString } from "./hast-utils/hast-to-string.js";
import { isMdxJsxElementHast } from "./mdx-utils/is-mdx-element.js";
import { toTree } from "./parse.js";

const TAG_NAMES_TO_STRIP = ["img", "video"];

export function stripUtil(
  markdown: string,
  format: "md" | "mdx" = "mdx"
): string {
  const { hast } = toTree(markdown, { format });

  visit(hast, (node, idx, parent) => {
    if (idx == null || parent == null) {
      return;
    }

    // mdast image, and hast img
    if (node.type === "element" && TAG_NAMES_TO_STRIP.includes(node.tagName)) {
      parent.children.splice(idx, 1);
      return idx;
    }

    // jsx img
    if (
      isMdxJsxElementHast(node) &&
      node.name &&
      TAG_NAMES_TO_STRIP.includes(node.name)
    ) {
      parent.children.splice(idx, 1);
      return idx;
    }
    return;
  });

  // TODO: (andrew), this might have some issues with formatting new lines
  return hastToString(hast);
}
