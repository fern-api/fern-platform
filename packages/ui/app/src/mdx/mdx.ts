import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkGemoji from "remark-gemoji";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkSmartypants from "remark-smartypants";
import type { PluggableList } from "unified";
import { emitDatadogError } from "../analytics/datadogRum";
import { stringHasMarkdown } from "./common/util";
import { rehypeFernCode } from "./plugins/rehypeFernCode";
import { rehypeFernComponents } from "./plugins/rehypeFernComponents";
import { rehypeFernLayout } from "./plugins/rehypeLayout";
import { rehypeSanitizeJSX } from "./plugins/rehypeSanitizeJSX";
import { customHeadingHandler } from "./plugins/remarkRehypeHandlers";

export interface FernDocsFrontmatter {
    title?: string;
    description?: string;
    editThisPageUrl?: string;
    image?: string;
    excerpt?: string;
    layout?: "overview" | "guide";
}

export type SerializedMdxContent = MDXRemoteSerializeResult<Record<string, unknown>, FernDocsFrontmatter> | string;

type SerializeOptions = NonNullable<Parameters<typeof serialize>[1]>;

export type SerializeMdxOptions = SerializeOptions["mdxOptions"];

type FernSerializeMdxOptions = SerializeMdxOptions & {
    renderLayout?: boolean;
    showError?: boolean;
};

function withDefaultMdxOptions({
    renderLayout,
    showError,
    ...options
}: FernSerializeMdxOptions = {}): SerializeMdxOptions {
    const remarkRehypeOptions = {
        ...options.remarkRehypeOptions,
        handlers: {
            heading: customHeadingHandler,
            ...options.remarkRehypeOptions?.handlers,
        },
    };

    const remarkPlugins: PluggableList = [remarkGfm, remarkSmartypants, remarkMath, remarkGemoji];

    if (options.remarkPlugins != null) {
        remarkPlugins.push(...options.remarkPlugins);
    }

    const rehypePlugins: PluggableList = [rehypeSlug, rehypeKatex, rehypeFernCode, rehypeFernComponents];

    if (options.rehypePlugins != null) {
        rehypePlugins.push(...options.rehypePlugins);
    }

    if (renderLayout) {
        rehypePlugins.push([rehypeFernLayout, { test: "test" }]);
    }

    // Always sanitize JSX at the end.
    rehypePlugins.push([rehypeSanitizeJSX, { showError }]);

    return {
        ...options,
        remarkRehypeOptions,
        remarkPlugins,
        rehypePlugins,
        format: "mdx",
        /**
         * development=true is required to render MdxRemote from the client-side.
         * https://github.com/hashicorp/next-mdx-remote/issues/350
         */
        development: process.env.NODE_ENV !== "production",
    };
}

/**
 * If the content is not markdown, it will be returned as is.
 */
export async function maybeSerializeMdxContent(
    content: string,
    mdxOptions?: FernSerializeMdxOptions,
): Promise<MDXRemoteSerializeResult | string>;
export async function maybeSerializeMdxContent(
    content: string | undefined,
    mdxOptions?: FernSerializeMdxOptions,
): Promise<MDXRemoteSerializeResult | string | undefined>;
export async function maybeSerializeMdxContent(
    content: string | undefined,
    mdxOptions: FernSerializeMdxOptions = {},
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
    mdxOptions?: FernSerializeMdxOptions,
): Promise<SerializedMdxContent>;
export async function serializeMdxWithFrontmatter(
    content: string | undefined,
    mdxOptions?: FernSerializeMdxOptions,
): Promise<SerializedMdxContent | undefined>;
export async function serializeMdxWithFrontmatter(
    content: string | undefined,
    mdxOptions: FernSerializeMdxOptions = {},
): Promise<SerializedMdxContent | undefined> {
    if (content == null) {
        return undefined;
    }
    try {
        return await serialize<Record<string, unknown>, FernDocsFrontmatter>(content, {
            scope: {},
            mdxOptions: withDefaultMdxOptions({ ...mdxOptions, renderLayout: true }),
            parseFrontmatter: true,
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
