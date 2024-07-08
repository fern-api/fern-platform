import { DocsV1Read } from "@fern-api/fdr-sdk";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkGemoji from "remark-gemoji";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkSmartypants from "remark-smartypants";
import type { PluggableList } from "unified";
import { captureSentryError } from "../analytics/sentry";
import { stringHasMarkdown } from "./common/util";
import { FernDocsFrontmatter } from "./frontmatter";
import { rehypeFernCode } from "./plugins/rehypeFernCode";
import { rehypeFernComponents } from "./plugins/rehypeFernComponents";
import { rehypeFernLayout } from "./plugins/rehypeLayout";
import { rehypeSanitizeJSX } from "./plugins/rehypeSanitizeJSX";
import { customHeadingHandler } from "./plugins/remarkRehypeHandlers";

export type SerializedMdxContent = MDXRemoteSerializeResult<Record<string, unknown>, FernDocsFrontmatter> | string;

type SerializeOptions = NonNullable<Parameters<typeof serialize>[1]>;

type SerializeMdxOptions = SerializeOptions["mdxOptions"];

export type FernSerializeMdxOptions = SerializeMdxOptions & {
    frontmatterOverrides?: FernDocsFrontmatter;
    showError?: boolean;
};

function withDefaultMdxOptions({
    frontmatterOverrides,
    showError = process.env.NODE_ENV === "development",
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

    // right now, only pages use frontmatterOverrides, so when null, it is implicit that we're serializing a description.
    if (frontmatterOverrides != null) {
        rehypePlugins.push([rehypeFernLayout, frontmatterOverrides]);
    }

    // Always sanitize JSX at the end.
    rehypePlugins.push([rehypeSanitizeJSX, { showError }]);

    return {
        /**
         * development=true is required to render MdxRemote from the client-side.
         * https://github.com/hashicorp/next-mdx-remote/issues/350
         */
        development: process.env.NODE_ENV !== "production",
        ...options,
        remarkRehypeOptions,
        remarkPlugins,
        rehypePlugins,
        format: "mdx",
    };
}

/**
 * If the content is not markdown, it will be returned as is.
 */
export async function maybeSerializeMdxContent(
    content: string,
    mdxOptions?: FernSerializeMdxOptions,
    files?: Record<DocsV1Read.FileId, DocsV1Read.File_>,
): Promise<MDXRemoteSerializeResult | string>;
export async function maybeSerializeMdxContent(
    content: string | undefined,
    mdxOptions?: FernSerializeMdxOptions,
    files?: Record<DocsV1Read.FileId, DocsV1Read.File_>,
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

    content = replaceBrokenBrTags(content);

    try {
        return await serialize(content, {
            scope: {},
            mdxOptions: withDefaultMdxOptions(mdxOptions),
            parseFrontmatter: false,
        });
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);

        captureSentryError(e, {
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
    files?: Record<DocsV1Read.FileId, DocsV1Read.File_>,
): Promise<SerializedMdxContent>;
export async function serializeMdxWithFrontmatter(
    content: string | undefined,
    mdxOptions?: FernSerializeMdxOptions,
    files?: Record<DocsV1Read.FileId, DocsV1Read.File_>,
): Promise<SerializedMdxContent | undefined>;
export async function serializeMdxWithFrontmatter(
    content: string | undefined,
    mdxOptions: FernSerializeMdxOptions = {},
): Promise<SerializedMdxContent | undefined> {
    if (content == null) {
        return undefined;
    }

    content = replaceBrokenBrTags(content);

    try {
        return await serialize<Record<string, unknown>, FernDocsFrontmatter>(content, {
            scope: {},
            mdxOptions: withDefaultMdxOptions(mdxOptions),
            parseFrontmatter: true,
        });
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);

        captureSentryError(e, {
            context: "MDX",
            errorSource: "maybeSerializeMdxContent",
            errorDescription: "Failed to serialize MDX content",
        });

        return content;
    }
}

export function replaceBrokenBrTags(content: string): string {
    return content.replaceAll(/<br\s*\/?>/g, "<br />").replaceAll("</br>", "");
}
