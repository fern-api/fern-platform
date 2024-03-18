import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import { SerializeOptions } from "next-mdx-remote/dist/types";
import { serialize } from "next-mdx-remote/serialize";
import remarkGemoji from "remark-gemoji";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { stringHasMarkdown } from "./common/util";
import { rehypeFernCode } from "./plugins/rehypeFernCode";
import { rehypeFernComponents } from "./plugins/rehypeFernComponents";
import { rehypeSanitizeJSX } from "./plugins/rehypeSanitizeJSX";

export interface FernDocsFrontmatter {
    title?: string;
    description?: string;
    editThisPageUrl?: string;
    image?: string;
    excerpt?: SerializedMdxContent;
}

export interface FernDocsFrontmatterInternal {
    title?: string;
    description?: string;
    editThisPageUrl?: string;
    image?: string;
    excerpt?: string;
}

export type SerializedMdxContent = MDXRemoteSerializeResult<Record<string, unknown>, FernDocsFrontmatter> | string;

const MDX_OPTIONS: SerializeOptions["mdxOptions"] = {
    remarkPlugins: [remarkParse, remarkRehype, remarkGfm, remarkGemoji],
    rehypePlugins: [rehypeFernCode, rehypeFernComponents, rehypeSanitizeJSX],
    format: "detect",
    /**
     * development=true is required to render MdxRemote from the client-side.
     * https://github.com/hashicorp/next-mdx-remote/issues/350
     */
    development: process.env.NODE_ENV !== "production",
};

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

        const firstPass = await serialize<Record<string, unknown>, FernDocsFrontmatterInternal>(content, {
            scope: {},
            mdxOptions: MDX_OPTIONS,
            parseFrontmatter: true,
        });

        let excerpt: SerializedMdxContent | undefined = firstPass.frontmatter?.excerpt;

        if (firstPass.frontmatter?.excerpt) {
            try {
                excerpt = await serialize(firstPass.frontmatter.excerpt, {
                    scope: {},
                    mdxOptions: MDX_OPTIONS,
                    parseFrontmatter: false,
                });
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error(e);
            }
        }

        return {
            frontmatter: {
                ...firstPass.frontmatter,
                excerpt,
            },
            compiledSource: firstPass.compiledSource,
            scope: firstPass.scope,
        };
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        // eslint-disable-next-line no-console
        console.log(content);
        return content;
    }
}
