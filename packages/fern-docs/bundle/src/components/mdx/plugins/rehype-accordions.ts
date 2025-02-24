import {
  CONTINUE,
  Hast,
  SKIP,
  Unified,
  extractAttributeValueLiteral,
  isMdxJsxAttribute,
  isMdxJsxElementHast,
  unknownToMdxJsxAttribute,
  visit,
} from "@fern-docs/mdx";

export const rehypeAccordions: Unified.Plugin<[], Hast.Root> = () => {
  return (ast: Hast.Root) => {
    visit(ast, (node, index, parent) => {
      if (!isMdxJsxElementHast(node)) {
        return CONTINUE;
      }

      if (node.name === "Accordions") {
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
