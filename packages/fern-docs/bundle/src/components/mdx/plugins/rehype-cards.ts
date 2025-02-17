import {
  CONTINUE,
  Hast,
  Unified,
  isMdxJsxElementHast,
  visit,
} from "@fern-docs/mdx";

export const rehypeCards: Unified.Plugin<[], Hast.Root> = () => {
  return (ast: Hast.Root) => {
    visit(ast, (node) => {
      if (!isMdxJsxElementHast(node)) {
        return CONTINUE;
      }

      if (node.name === "Cards") {
        node.name = "CardGroup";
      }

      return CONTINUE;
    });
  };
};
