import {
  isMdxJsxAttribute,
  isMdxJsxElementHast,
  mdxJsxAttributeToString,
  visit,
  type Hast,
} from "@fern-docs/mdx";

export interface RehypeLinksOptions {
  replaceHref?(href: string): string | undefined;
}

export function rehypeLinks({ replaceHref }: RehypeLinksOptions = {}): (
  ast: Hast.Root
) => void {
  return function (ast): void {
    if (replaceHref == null) {
      return;
    }
    visit(ast, (node) => {
      if (node.type === "element" && node.tagName === "a") {
        const href = node.properties.href;
        if (typeof href !== "string") {
          return;
        }
        const newHref = replaceHref(href);
        if (newHref == null) {
          return;
        }
        node.properties.href = newHref;
      }

      // TODO handle nested attributes and mdx expressions
      if (isMdxJsxElementHast(node)) {
        const attributes = node.attributes.filter(isMdxJsxAttribute);
        const hrefAttribute = attributes.find((attr) => attr.name === "href");
        if (hrefAttribute == null) {
          return;
        }
        const href = mdxJsxAttributeToString(hrefAttribute);
        if (!href) {
          return;
        }
        const newHref = replaceHref(href);
        if (newHref == null) {
          return;
        }
        hrefAttribute.value = newHref;
      }
    });
  };
}
