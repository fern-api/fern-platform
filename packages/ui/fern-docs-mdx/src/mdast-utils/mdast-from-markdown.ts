import type { Root as MdastRoot } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { mdxFromMarkdown } from "mdast-util-mdx";
import { mdxjs } from "micromark-extension-mdxjs";
import { UnreachableCaseError } from "ts-essentials";

export function mdastFromMarkdown(content: string, format: "mdx" | "md" = "mdx"): MdastRoot {
    if (format === "md") {
        return fromMarkdown(content);
    } else if (format === "mdx") {
        return fromMarkdown(content, {
            extensions: [mdxjs()],
            mdastExtensions: [mdxFromMarkdown()],
        });
    } else {
        throw new UnreachableCaseError(format);
    }
}
