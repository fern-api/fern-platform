import { isMdxJsxElementHast } from "@fern-docs/mdx";
import type { Root } from "hast";
import { visit } from "unist-util-visit";

interface Options {
  aliases: Record<string, string>;
}

export function rehypeJsxAlias(
  options: Options = { aliases: {} }
): (tree: Root) => void {
  return function (tree: Root): void {
    // map intrinsic HTML components to their Fern equivalents
    visit(tree, (node) => {
      if (isMdxJsxElementHast(node) && node.name) {
        const alias = options.aliases[node.name];
        if (alias != null) {
          node.name = alias;
        }
      }
    });
  };
}
