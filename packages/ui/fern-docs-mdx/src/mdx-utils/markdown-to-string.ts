import { toString as mdastToString } from "mdast-util-to-string";
import { toTree } from "../parse.js";

/**
 * Strips the markdown of all formatting and returns a plain string.
 */
export function markdownToString(markdown: string, format?: "md" | "mdx"): string;
export function markdownToString(markdown: string | undefined, format?: "md" | "mdx"): string | undefined;
export function markdownToString(markdown: string | undefined, format?: "md" | "mdx"): string | undefined {
    if (markdown == null) {
        return undefined;
    }
    try {
        const tree = toTree(markdown, { format });
        return mdastToString(tree.mdast, {
            includeImageAlt: false,
            includeHtml: false,
        }).trim();
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return markdown;
    }
}
