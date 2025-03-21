import {
  CONTINUE,
  Hast,
  SKIP,
  Unified,
  isMdxJsxElementHast,
  visit,
} from "@fern-docs/mdx";

export const rehypeAccordions: Unified.Plugin<[], Hast.Root> = () => {
  return (ast: Hast.Root) => {
    visit(ast, (node, index, parent) => {
      if (!isMdxJsxElementHast(node)) {
        return CONTINUE;
      }

      // conform aliases
      if (node.name === "Expandable") {
        node.name = "Accordion";
      } else if (node.name === "Accordions") {
        node.name = "AccordionGroup";
      }

      if (node.name === "Accordion" && parent != null && index != null) {
        // ensure the parent component is an AccordionGroup
        if (isMdxJsxElementHast(parent) && parent.name === "AccordionGroup") {
          return CONTINUE;
        }

        const accordionGroup = {
          type: "mdxJsxFlowElement" as const,
          name: "AccordionGroup",
          children: [node],
          attributes: [],
        };

        parent.children[index] = accordionGroup;
        return [SKIP, index];
      }

      return CONTINUE;
    });
  };
};
