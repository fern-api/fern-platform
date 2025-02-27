import {
  CONTINUE,
  Hast,
  SKIP,
  Unified,
  isMdxJsxElementHast,
  visit,
} from "@fern-docs/mdx";

export const rehypeTabs: Unified.Plugin<[], Hast.Root> = () => {
  return (ast: Hast.Root) => {
    visit(ast, (node, index, parent) => {
      if (!isMdxJsxElementHast(node)) {
        return CONTINUE;
      }

      if (node.name === "Tabs") {
        node.name = "TabGroup";
      }

      if (node.name === "Tab" && parent != null && index != null) {
        // ensure the parent component is a TabGroup
        if (isMdxJsxElementHast(parent) && parent.name === "TabGroup") {
          return CONTINUE;
        }

        const tabGroup = {
          type: "mdxJsxFlowElement" as const,
          name: "TabGroup",
          children: [node],
          attributes: [],
        };

        parent.children[index] = tabGroup;

        // revisit the current node to traverse its children
        return [SKIP, index];
      }

      return CONTINUE;
    });
  };
};
