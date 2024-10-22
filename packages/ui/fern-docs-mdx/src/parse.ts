import type { Root as HastRoot } from "hast";
import type { Root as MdastRoot } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { mdxFromMarkdown, mdxToMarkdown } from "mdast-util-mdx";
import { toHast } from "mdast-util-to-hast";
import { toMarkdown } from "mdast-util-to-markdown";
import { mdxjs } from "micromark-extension-mdxjs";
import rehypeSlug from "rehype-slug";
import { UnreachableCaseError } from "ts-essentials";
import { extractJsx } from "./extract-jsx.js";
import { customHeadingHandler } from "./handlers/custom-headings.js";
import { rehypeExtractAsides } from "./plugins/rehype-extract-asides.js";
import { remarkMarkAndUnravel } from "./plugins/remark-mark-and-unravel.js";

const MDX_NODE_TYPES = [
    "mdxFlowExpression",
    "mdxJsxFlowElement",
    "mdxJsxTextElement",
    "mdxTextExpression",
    "mdxjsEsm",
] as const;

export function markdownToMdast(content: string, type: "mdx" | "md" = "mdx"): MdastRoot {
    if (type === "md") {
        return fromMarkdown(content);
    } else if (type === "mdx") {
        return fromMarkdown(content, {
            extensions: [mdxjs()],
            mdastExtensions: [mdxFromMarkdown()],
        });
    } else {
        throw new UnreachableCaseError(type);
    }
}

export function mdastToMarkdown(mdast: MdastRoot): string {
    return toMarkdown(mdast, {
        extensions: [mdxToMarkdown()],
    });
}

/**
 * This is essentially a condensed version of https://github.com/mdx-js/mdx/blob/eee85d54152499c526cf8c06076be5b563037ff8/packages/mdx/lib/core.js#L163
 * minus converting to JS string. This is a bit of a hack to extract the ToC, Aside elements, and a list of JSX elements being used in the markdown.
 */
export function toTree(
    content: string,
    type: "mdx" | "md" = "mdx",
): {
    mdast: MdastRoot;
    hast: HastRoot;
    jsxElements: string[];
    esmElements: string[];
} {
    const mdast = markdownToMdast(content, type);

    // this is forked from mdxjs, but we need to run it before we convert to hast
    // so that we can correctly identify explicit JSX nodes
    remarkMarkAndUnravel()(mdast);

    const hast = toHast(mdast, {
        handlers: {
            heading: customHeadingHandler,
        },
        allowDangerousHtml: true,
        passThrough: [...MDX_NODE_TYPES],
    }) as HastRoot;

    // add ids to headings
    rehypeSlug()(hast);

    // extract asides and insert them into the root hast tree
    rehypeExtractAsides()(hast);

    return {
        mdast,
        hast,
        ...extractJsx(hast),
    };
}
