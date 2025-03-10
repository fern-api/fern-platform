import {
  CONTINUE,
  Hast,
  SKIP,
  Unified,
  isMdxJsxAttribute,
  isMdxJsxElementHast,
  visit,
} from "@fern-docs/mdx";

export const rehypeCards: Unified.Plugin<[], Hast.Root> = () => {
  return (ast: Hast.Root) => {
    visit(ast, (node, index, parent) => {
      if (!isMdxJsxElementHast(node)) {
        return CONTINUE;
      }

      if (node.name === "Cards") {
        node.name = "CardGroup";
      }

      if (node.name === "Card" && parent != null && index != null) {
        const iconSizeAttr = node.attributes
          .filter(isMdxJsxAttribute)
          .find((attr) => attr.name === "iconSize");

        // ensure icon size is a number
        if (iconSizeAttr) {
          const iconSize = Number(iconSizeAttr.value);
          if (isNaN(iconSize)) {
            iconSizeAttr.value = "8";
          }
        }

        // ensure the parent component is a CardGroup
        if (isMdxJsxElementHast(parent) && parent.name === "CardGroup") {
          return CONTINUE;
        }

        parent.children[index] = {
          type: "mdxJsxFlowElement" as const,
          name: "CardGroup",
          children: [node],
          attributes: [],
        };

        // revisit the current node to traverse its children
        return [SKIP, index];
      }

      return CONTINUE;
    });
  };
};
