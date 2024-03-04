import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { rehypeFernCode } from "./plugins/rehypeFernCode";
import { rehypeSanitizeJSX } from "./plugins/rehypeSanitizeJSX";

export interface FernDocsFrontmatter {
    title?: string;
    description?: string;
    editThisPageUrl?: string;
    image?: string;
}

export type SerializedMdxContent = MDXRemoteSerializeResult<Record<string, unknown>, FernDocsFrontmatter> | string;

function stringHasMarkdown(s: string): boolean {
    s = s.trim();

    // has frontmatter
    if (s.startsWith("---")) {
        return true;
    }

    // has headings (using regex, match if any line starts with 1-6 #)
    if (s.match(/^\s+#{1,6} .+/m)) {
        return true;
    }

    // has list items or blockquotes
    if (s.match(/^\s+[*->] .+/m)) {
        return true;
    }

    // has numbered list items
    if (s.match(/^\s+\d+\. .+/m)) {
        return true;
    }

    // has inline code or code blocks
    if (s.includes("`")) {
        return true;
    }

    // has links or images
    if (s.match(/\[.+\]\(.+\)/)) {
        return true;
    }

    // has html or jsx tags
    if (s.includes("<")) {
        return true;
    }

    return false;
}

/**
 * Should only be invoked server-side.
 */
export async function serializeMdxContent(content: string, forceMarkdown?: boolean): Promise<SerializedMdxContent>;
export async function serializeMdxContent(
    content: string | undefined,
    forceMarkdown?: boolean,
): Promise<SerializedMdxContent | undefined>;
export async function serializeMdxContent(
    content: string | undefined,
    forceMarkdown?: boolean,
): Promise<SerializedMdxContent | undefined> {
    if (content == null) {
        return undefined;
    }
    try {
        if (!stringHasMarkdown(content) && !forceMarkdown) {
            return content;
        }

        return await serialize(content, {
            scope: {},
            mdxOptions: {
                remarkPlugins: [remarkParse, remarkRehype, remarkGfm],
                rehypePlugins: [rehypeFernCode, rehypeSanitizeJSX],
                format: "detect",
                /**
                 * development=true is required to render MdxRemote from the client-side.
                 * https://github.com/hashicorp/next-mdx-remote/issues/350
                 */
                development: process.env.NODE_ENV !== "production",
            },
            parseFrontmatter: true,
        });
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        // eslint-disable-next-line no-console
        console.log(content);
        return content;
    }
}
