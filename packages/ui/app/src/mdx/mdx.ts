import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkGemoji from "remark-gemoji";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkSmartypants from "remark-smartypants";
import { emitDatadogError } from "../analytics/datadogRum";
import { stringHasMarkdown } from "./common/util";
import { rehypeFernCode } from "./plugins/rehypeFernCode";
import { rehypeFernComponents } from "./plugins/rehypeFernComponents";
import { rehypeSanitizeJSX } from "./plugins/rehypeSanitizeJSX";
import { customHeadingHandler } from "./plugins/remarkRehypeHandlers";

export interface FernDocsFrontmatterRaw {
    title?: string;
    description?: string;
    editThisPageUrl?: string;
    image?: string;
    excerpt?: string;
    layout?: "overview" | "guide";
}

export interface FernDocsFrontmatter extends Omit<FernDocsFrontmatterRaw, "excerpt"> {
    excerpt?: MDXRemoteSerializeResult | string;
}

export type SerializedMdxContent = MDXRemoteSerializeResult<Record<string, unknown>, FernDocsFrontmatter> | string;

type SerializeOptions = NonNullable<Parameters<typeof serialize>[1]>;

export type SerializeMdxOptions = SerializeOptions["mdxOptions"];

const MDX_OPTIONS: Exclude<SerializeMdxOptions, undefined> = {
    remarkRehypeOptions: {
        handlers: {
            heading: customHeadingHandler,
        },
    },

    remarkPlugins: [remarkGfm, remarkSmartypants, remarkMath, remarkGemoji],
    rehypePlugins: [rehypeSlug, rehypeKatex, rehypeFernCode, rehypeFernComponents, rehypeSanitizeJSX],
    format: "mdx",
    /**
     * development=true is required to render MdxRemote from the client-side.
     * https://github.com/hashicorp/next-mdx-remote/issues/350
     */
    development: process.env.NODE_ENV !== "production",
};

function withDefaultMdxOptions(options: SerializeMdxOptions = {}): SerializeMdxOptions {
    return {
        ...MDX_OPTIONS,
        ...options,
        remarkPlugins: [...(MDX_OPTIONS.remarkPlugins ?? []), ...(options.remarkPlugins ?? [])],
        rehypePlugins: [...(MDX_OPTIONS.rehypePlugins ?? []), ...(options.rehypePlugins ?? [])],
        remarkRehypeOptions: {
            ...MDX_OPTIONS.remarkRehypeOptions,
            ...options.remarkRehypeOptions,
            handlers: {
                ...MDX_OPTIONS.remarkRehypeOptions?.handlers,
                ...options.remarkRehypeOptions?.handlers,
            },
        },
    };
}

/**
 * If the content is not markdown, it will be returned as is.
 */
export async function maybeSerializeMdxContent(
    content: string,
    mdxOptions?: SerializeOptions["mdxOptions"],
): Promise<MDXRemoteSerializeResult | string>;
export async function maybeSerializeMdxContent(
    content: string | undefined,
    mdxOptions?: SerializeOptions["mdxOptions"],
): Promise<MDXRemoteSerializeResult | string | undefined>;
export async function maybeSerializeMdxContent(
    content: string | undefined,
    mdxOptions: SerializeOptions["mdxOptions"] = {},
): Promise<MDXRemoteSerializeResult | string | undefined> {
    if (content == null) {
        return undefined;
    }

    if (!stringHasMarkdown(content)) {
        return content;
    }

    try {
        return await serialize(content, {
            scope: {},
            mdxOptions: withDefaultMdxOptions(mdxOptions),
            parseFrontmatter: false,
        });
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);

        emitDatadogError(e, {
            context: "MDX",
            errorSource: "maybeSerializeMdxContent",
            errorDescription: "Failed to serialize MDX content",
        });

        return content;
    }
}

/**
 * Should only be invoked server-side.
 */
export async function serializeMdxWithFrontmatter(
    content: string,
    mdxOptions?: SerializeOptions["mdxOptions"],
): Promise<SerializedMdxContent>;
export async function serializeMdxWithFrontmatter(
    content: string | undefined,
    mdxOptions?: SerializeOptions["mdxOptions"],
): Promise<SerializedMdxContent | undefined>;
export async function serializeMdxWithFrontmatter(
    content: string | undefined,
    mdxOptions: SerializeOptions["mdxOptions"] = {},
): Promise<SerializedMdxContent | undefined> {
    if (content == null) {
        return undefined;
    }
    try {
        const firstPass = await serialize<Record<string, unknown>, FernDocsFrontmatterRaw>(content, {
            scope: {},
            mdxOptions: withDefaultMdxOptions(mdxOptions),
            parseFrontmatter: true,
        });

        let excerpt: MDXRemoteSerializeResult | string | undefined = firstPass.frontmatter?.excerpt;

        if (firstPass.frontmatter?.excerpt) {
            try {
                excerpt = await serialize(firstPass.frontmatter.excerpt, {
                    scope: {},
                    mdxOptions: withDefaultMdxOptions(mdxOptions),
                    parseFrontmatter: false,
                });
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error(e);

                emitDatadogError(e, {
                    context: "MDX",
                    errorSource: "maybeSerializeMdxContent",
                    errorDescription: "Failed to serialize subtitle (excerpt) from frontmatter",
                });
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

        emitDatadogError(e, {
            context: "MDX",
            errorSource: "maybeSerializeMdxContent",
            errorDescription: "Failed to serialize MDX content",
        });

        return content;
    }
}
