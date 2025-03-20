import {
  CONTINUE,
  Hast,
  Unified,
  isMdxJsxAttribute,
  isMdxJsxElementHast,
  unknownToMdxJsxAttribute,
  visit,
} from "@fern-docs/mdx";

// collect headers nested in an accordion so we know when to expand
export const rehypeAccordionNestedHeaders: Unified.Plugin<
  [],
  Hast.Root
> = () => {
  return (ast: Hast.Root) => {
    visit(ast, (node) => {
      if (!isMdxJsxElementHast(node)) {
        return CONTINUE;
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

        return CONTINUE;
      }

      return CONTINUE;
    });
  };
};
