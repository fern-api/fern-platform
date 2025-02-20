import {
  CONTINUE,
  Hast,
  isMdxJsxAttribute,
  isMdxJsxElementHast,
  SKIP,
  visit,
} from "@fern-docs/mdx";

/**
 * The goal of this plugin is to squeeze the <Download> element into a <Button> element with the `href` and `download` attributes set.
 * This is to avoid <a><button /></a> which is invalid HTML.
 */
export function rehypeDownload() {
  return (ast: Hast.Root) => {
    visit(ast, (node, index, parent) => {
      if (!isMdxJsxElementHast(node) || !parent || index == null) {
        return CONTINUE;
      }

      if (
        node.name === "Download" &&
        node.children.length === 1 &&
        node.children[0]
      ) {
        const child = node.children[0];
        if (isMdxJsxElementHast(child) && child.name === "Button") {
          const srcAttr = node.attributes
            .filter(isMdxJsxAttribute)
            .find((attr) => attr.name === "src");

          if (!srcAttr) {
            return CONTINUE;
          }

          const filenameAttr = node.attributes
            .filter(isMdxJsxAttribute)
            .find((attr) => attr.name === "filename");

          // inject the src attribute as a href
          child.attributes.push({
            type: "mdxJsxAttribute",
            name: "href",
            value: srcAttr.value,
          });

          // force the button to be a download
          child.attributes.push({
            type: "mdxJsxAttribute",
            name: "download",
            value: filenameAttr?.value ?? "",
          });

          parent.children[index] = child;

          return SKIP;
        }
      }
      return CONTINUE;
    });
  };
}
