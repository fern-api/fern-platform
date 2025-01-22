import type { Root as HastRoot } from "hast";
import type { Root as MdastRoot } from "mdast";
import { toHast } from "mdast-util-to-hast";
import rehypeSlug from "rehype-slug";
import { customHeadingHandler } from "./handlers/custom-headings";
import { mdastFromMarkdown } from "./mdast-utils/mdast-from-markdown";
import { extractJsx } from "./mdx-utils/extract-jsx";
import { remarkMarkAndUnravel } from "./plugins/remark-mark-and-unravel";
import { remarkSanitizeAcorn } from "./plugins/remark-sanitize-acorn";
import { sanitizeBreaks } from "./sanitize/sanitize-breaks";
import { sanitizeMdxExpression } from "./sanitize/sanitize-mdx-expression";

const MDX_NODE_TYPES = [
  "mdxFlowExpression",
  "mdxJsxFlowElement",
  "mdxJsxTextElement",
  "mdxTextExpression",
  "mdxjsEsm",
] as const;

interface ToTreeOptions {
  format?: "mdx" | "md";
  allowedIdentifiers?: string[];
  sanitize?: boolean;
}

/**
 * This is essentially a condensed version of https://github.com/mdx-js/mdx/blob/eee85d54152499c526cf8c06076be5b563037ff8/packages/mdx/lib/core.js#L163
 * minus converting to JS string. This is a bit of a hack to extract the ToC, Aside elements, and a list of JSX elements being used in the markdown.
 */
export function toTree(
  content: string,
  {
    format = "mdx",
    allowedIdentifiers = [],
    sanitize = true,
  }: ToTreeOptions = {}
): {
  mdast: MdastRoot;
  hast: HastRoot;
  jsxElements: string[];
  esmElements: string[];
} {
  content =
    sanitize && format === "mdx"
      ? sanitizeMdxExpression(sanitizeBreaks(content))[0]
      : content;

  const mdast = mdastFromMarkdown(content, format);

  // this is forked from mdxjs, but we need to run it before we convert to hast
  // so that we can correctly identify explicit JSX nodes
  remarkMarkAndUnravel()(mdast);

  if (sanitize) {
    // sanitize the acorn expressions
    remarkSanitizeAcorn({ allowedIdentifiers })(mdast);
  }

  const hast = toHast(mdast, {
    handlers: {
      heading: customHeadingHandler,
    },
    allowDangerousHtml: true,
    passThrough: [...MDX_NODE_TYPES],
  }) as HastRoot;

  // add ids to headings
  rehypeSlug()(hast);

  return {
    mdast,
    hast,
    ...extractJsx(hast),
  };
}
