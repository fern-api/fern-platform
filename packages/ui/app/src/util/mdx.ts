import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { rehypeFernCode } from "../commons/FernSyntaxHighlighterContent";

export interface FernDocsFrontmatter {
    title?: string;
    description?: string;
    editThisPageUrl?: string;
    image?: string;
}

export type SerializedMdxContent = MDXRemoteSerializeResult<Record<string, unknown>, FernDocsFrontmatter> | string;

/**
 * Should only be invoked server-side.
 */
export async function serializeMdxContent(content: string): Promise<SerializedMdxContent>;
export async function serializeMdxContent(content: string | undefined): Promise<SerializedMdxContent | undefined>;
export async function serializeMdxContent(content: string | undefined): Promise<SerializedMdxContent | undefined> {
    if (content == null) {
        return undefined;
    }
    try {
        return await serialize(content, {
            scope: {},
            mdxOptions: {
                remarkPlugins: [remarkParse, remarkRehype, remarkGfm],
                rehypePlugins: [rehypeFernCode, rehypeStringify],
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
