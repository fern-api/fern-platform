import { walk } from "estree-walker";
import { toEstree } from "hast-util-to-estree";
import { toHast } from "mdast-util-to-hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { mdastFromMarkdown } from "../mdast-utils/mdast-from-markdown";
import { isMdxExpression } from "../mdx-utils";
import { Hast, Mdast } from "../types";

export const rehypeExpressionToMd: Plugin<[], Hast.Root> = () => (ast) => {
  visit(ast, (node) => {
    if (!isMdxExpression(node)) {
      return;
    }
    const estree = node.data?.estree;
    if (!estree) {
      return;
    }
    walk(estree, {
      enter(node) {
        if (node.type === "JSXText") {
          const mdast = mdastFromMarkdown(node.value, "md");
          if (
            withoutParagraphs(mdast).every((child) => child.type === "text")
          ) {
            return;
          }
          const hast = toHast(mdast);
          const estree = toEstree(hast);
          const expression =
            estree.body[0]?.type === "ExpressionStatement"
              ? estree.body[0].expression
              : null;
          if (expression) {
            this.replace(expression);
          }
        }
      },
    });
  });
};

function withoutParagraphs(mdast: Mdast.Root): Mdast.PhrasingContent[] {
  return mdast.children.flatMap((child) => {
    if (child.type === "paragraph") {
      return child.children;
    }
    return [];
  });
}
