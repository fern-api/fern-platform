import rehypeShiki, { RehypeShikiOptions } from "@shikijs/rehype";

import { CONTINUE, Hast, SKIP, Unified, visit } from "@fern-docs/mdx";

export const conditionalRehypeShiki: Unified.Plugin<
  [RehypeShikiOptions],
  Hast.Root
> = function (options) {
  const originalPlugin = rehypeShiki.call(this, options);

  return function transformer(
    this: Unified.Processor,
    tree: Hast.Root,
    file: any
  ) {
    if (!originalPlugin) {
      return;
    }

    let hasTwoslashCode = false;

    visit(tree, "element", (node) => {
      if (
        node.tagName === "pre" &&
        node.children?.[0] &&
        "tagName" in node.children[0] &&
        node.children[0].tagName === "code" &&
        "data" in node.children[0] &&
        node.children[0].data &&
        "meta" in node.children[0].data
      ) {
        const meta = String(node.children[0].data.meta);
        if (meta.includes("twoslash")) {
          hasTwoslashCode = true;
          return SKIP;
        }
      }
      return CONTINUE;
    });

    if (!hasTwoslashCode) {
      return;
    }

    return originalPlugin.call(this, tree, file, function noop() {
      return undefined;
    });
  };
};
