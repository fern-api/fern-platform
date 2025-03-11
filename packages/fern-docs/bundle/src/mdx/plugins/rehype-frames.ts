import { toEstree } from "hast-util-to-estree";
import { toHast } from "mdast-util-to-hast";

import {
  CONTINUE,
  Hast,
  Mdast,
  MdxJsxAttribute,
  Unified,
  isMdxJsxElementHast,
  mdastFromMarkdown,
  visit,
} from "@fern-docs/mdx";

export const rehypeFrames: Unified.Plugin<[], Hast.Root> = () => {
  return (ast: Hast.Root) => {
    visit(ast, (node) => {
      if (!isMdxJsxElementHast(node)) {
        return CONTINUE;
      }

      if (node.name === "Frame") {
        const captionAttribute = node.attributes.find(
          (attr): attr is MdxJsxAttribute =>
            attr.type === "mdxJsxAttribute" && attr.name === "caption"
        );

        if (captionAttribute && typeof captionAttribute.value === "string") {
          const expression = mdToEstree(captionAttribute?.value);
          if (expression) {
            captionAttribute.value = {
              type: "mdxJsxAttributeValueExpression",
              value: captionAttribute.value,
              data: {
                estree: expression,
              },
            };
          }
        }
      }

      return CONTINUE;
    });
  };
};

function mdToEstree(string: string) {
  const mdast = mdastFromMarkdown(string, "md"); // this plugin only applies to markdown, not mdx

  // only replace if the string actually contains markdown
  const children = withoutParagraphs(mdast);
  if (
    children.length === 0 ||
    children.every((child) => child.type === "text")
  ) {
    return;
  }

  const hast = toHast(mdast);
  const estree = toEstree(hast);
  return estree;
}

function withoutParagraphs(mdast: Mdast.Root): Mdast.PhrasingContent[] {
  return mdast.children.flatMap((child) => {
    if (child.type === "paragraph") {
      return child.children;
    }
    return [];
  });
}
