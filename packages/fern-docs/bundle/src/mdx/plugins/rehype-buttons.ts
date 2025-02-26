import {
  CONTINUE,
  Hast,
  Unified,
  isMdxJsxElementHast,
  visit,
} from "@fern-docs/mdx";

export const rehypeButtons: Unified.Plugin<[], Hast.Root> = () => {
  return (ast: Hast.Root) => {
    visit(ast, (node) => {
      if (!isMdxJsxElementHast(node)) {
        return CONTINUE;
      }

      if (node.name === "Buttons") {
        node.name = "ButtonGroup";
      }

      return CONTINUE;
    });
  };
};
