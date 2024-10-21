import type { Root } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { mdxFromMarkdown } from "mdast-util-mdx";
import { mdx } from "micromark-extension-mdx";

export function parseMarkdownToTree(content: string): Root {
    return fromMarkdown(content, {
        extensions: [mdx()],
        mdastExtensions: [mdxFromMarkdown()],
    });
}
