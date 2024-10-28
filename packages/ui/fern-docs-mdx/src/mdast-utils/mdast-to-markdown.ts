import type { Root as MdastRoot } from "mdast";
import { mathToMarkdown } from "mdast-util-math";
import { mdxToMarkdown } from "mdast-util-mdx";
import { toMarkdown } from "mdast-util-to-markdown";

export function mdastToMarkdown(mdast: MdastRoot): string {
    return toMarkdown(mdast, {
        extensions: [mdxToMarkdown(), mathToMarkdown()],
    });
}
