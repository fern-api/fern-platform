import { Program } from "estree";
import { walk } from "estree-walker";
import { toEstree } from "hast-util-to-estree";
import { toHast } from "mdast-util-to-hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { mdastFromMarkdown } from "../mdast-utils/mdast-from-markdown";
import {
  isMdxExpression,
  isMdxJsxAttribute,
  isMdxJsxElementHast,
} from "../mdx-utils";
import { Hast, Mdast } from "../types";

export const rehypeExpressionToMd: Plugin<[], Hast.Root> = () => (ast) => {
  visit(ast, (node) => {
    /**
     * Example:
     * {<div>[Hello](https://example.com)</div>} -> {<div><a href="https://example.com">Hello</a></div>}
     */
    if (isMdxExpression(node)) {
      const estree = node.data?.estree;
      if (!estree) {
        return;
      }
      replaceJsxTextToMarkdown(estree);
    }

    /**
     * Example:
     * <Frame caption="[Hello](https://example.com)" /> -> <Frame caption={<a href="https://example.com">Hello</a>} />
     */
    if (isMdxJsxElementHast(node)) {
      node.attributes.forEach((attribute) => {
        if (
          isMdxJsxAttribute(attribute) &&
          typeof attribute.value === "string"
        ) {
          const expression = mdToEstree(attribute.value);
          if (expression) {
            attribute.value = {
              type: "mdxJsxAttributeValueExpression",
              value: attribute.value,
              data: { estree: expression },
            };
          }
        }
      });
    }
  });
};

function replaceJsxTextToMarkdown(estree: Program) {
  walk(estree, {
    enter(node) {
      if (node.type === "JSXText") {
        const replacement = mdToEstree(node.value);
        if (replacement) {
          const expression = getExpression(replacement);
          if (expression) {
            this.replace(expression);
          }
        }
      }
    },
  });
}

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

function getExpression(estree: Program) {
  return estree.body[0]?.type === "ExpressionStatement"
    ? estree.body[0].expression
    : null;
}

function withoutParagraphs(mdast: Mdast.Root): Mdast.PhrasingContent[] {
  return mdast.children.flatMap((child) => {
    if (child.type === "paragraph") {
      return child.children;
    }
    return [];
  });
}
