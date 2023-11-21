import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";

const REMARK_PLUGINS = [remarkGfm];

export type SerializedMdxContent = MDXRemoteSerializeResult<Record<string, unknown>, Record<string, unknown>>;

/**
 * Should only be invoked server-side.
 */
export async function serializeMdxContent(content: string, isPreview: boolean = false): Promise<SerializedMdxContent> {
    return await serialize(content, {
        scope: {},
        mdxOptions: {
            remarkPlugins: REMARK_PLUGINS,
            format: "detect",
            /**
             * development=true is required to render MdxRemote from the client-side.
             * https://github.com/hashicorp/next-mdx-remote/issues/350
             */
            development: isPreview && false,
        },
        parseFrontmatter: false,
    });
}
