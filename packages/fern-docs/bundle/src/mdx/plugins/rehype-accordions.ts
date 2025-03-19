import {
  CONTINUE,
  Hast,
  SKIP,
  Unified,
  hastMdxJsxElementHastToProps,
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

      // conform aliases
      if (node.name === "Expandable") {
        node.name = "Accordion";
      } else if (node.name === "Accordions") {
        node.name = "AccordionGroup";
      }

      if (node.name === "Accordion") {
        // collect any headers nested within an accordion
        const nestedHeaders: string[] = [];
        if (node.children.length > 0) {
          const collectHeaders = (
            items: (Hast.Element | Hast.MdxJsxElement)[]
          ) => {
            items.forEach((item) => {
              if (item.type === "element") {
                if (item.properties?.id) {
                  nestedHeaders.push(item.properties.id as string);
                }

                if (item.children) {
                  collectHeaders(
                    item.children.filter(
                      (child): child is Hast.Element | Hast.MdxJsxElement =>
                        child.type === "element" ||
                        child.type === "mdxJsxFlowElement"
                    )
                  );
                }
              } else if (item.type === "mdxJsxFlowElement") {
                const itemId = item.attributes
                  .filter(isMdxJsxAttribute)
                  .find((attr) => attr.name === "id");
                if (itemId?.value && typeof itemId.value === "string") {
                  nestedHeaders.push(itemId.value);
                }

                if (item.children) {
                  collectHeaders(
                    item.children.filter(
                      (child): child is Hast.Element | Hast.MdxJsxElement =>
                        child.type === "element" ||
                        child.type === "mdxJsxFlowElement"
                    )
                  );
                }
              }
            });
          };

          collectHeaders(
            node.children.filter(
              (child): child is Hast.Element | Hast.MdxJsxElement =>
                child.type === "element" || child.type === "mdxJsxFlowElement"
            )
          );
        }

        node.attributes.push(
          unknownToMdxJsxAttribute("nestedHeaders", nestedHeaders)
        );

        // always wrap an accordion in an accordion group
        if (parent != null && index != null) {
          if (isMdxJsxElementHast(parent) && parent.name === "AccordionGroup") {
            const { props } = hastMdxJsxElementHastToProps(node);
            const items = [{ ...props }];
            parent.attributes.push(unknownToMdxJsxAttribute("items", items));
            return CONTINUE;
          }

          const { props } = hastMdxJsxElementHastToProps(node);
          const items = [{ ...props }];
          const accordionGroup = {
            type: "mdxJsxFlowElement" as const,
            name: "AccordionGroup",
            children: [node],
            attributes: [unknownToMdxJsxAttribute("items", items)],
          };

          parent.children[index] = accordionGroup;
          return [SKIP, index];
        }
      }

      return CONTINUE;
    });
  };
};
