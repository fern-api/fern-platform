import type { Root as HastRoot } from "hast";
import type { Root as MdastRoot } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { mdxFromMarkdown, mdxToMarkdown } from "mdast-util-mdx";
import { toHast } from "mdast-util-to-hast";
import { toMarkdown } from "mdast-util-to-markdown";
import { mdxjs } from "micromark-extension-mdxjs";
import rehypeSlug from "rehype-slug";
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

export function markdownToMdast(content: string): MdastRoot {
    return fromMarkdown(content, {
        extensions: [mdxjs()],
        mdastExtensions: [mdxFromMarkdown()],
    });
}

export function mdastToMarkdown(mdast: MdastRoot): string {
    return toMarkdown(mdast, {
        extensions: [mdxToMarkdown()],
    });
}

export function toTree(content: string): {
    mdast: MdastRoot;
    hast: HastRoot;
    jsxElements: string[];
    esmElements: string[];
} {
    const mdast = markdownToMdast(content);

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
