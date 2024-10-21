import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { customHeadingHandler, sanitizeBreaks, sanitizeMdxExpression, toTree } from "@fern-ui/fern-docs-mdx";
import {
    rehypeAcornErrorBoundary,
    rehypeExtractAsides,
    rehypeMdxClassStyle,
    rehypeSqueezeParagraphs,
    remarkSanitizeAcorn,
    remarkSqueezeParagraphs,
} from "@fern-ui/fern-docs-mdx/plugins";
import { serialize } from "next-mdx-remote/serialize";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkGemoji from "remark-gemoji";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkSmartypants from "remark-smartypants";
import type { PluggableList } from "unified";
import { rehypeFernCode } from "../plugins/rehypeFernCode";
import { rehypeFernComponents } from "../plugins/rehypeFernComponents";
import type { FernSerializeMdxOptions } from "../types";

type SerializeOptions = NonNullable<Parameters<typeof serialize>[1]>;

function withDefaultMdxOptions({ options = {} }: FernSerializeMdxOptions = {}): SerializeOptions["mdxOptions"] {
    const remarkRehypeOptions = {
        ...options.remarkRehypeOptions,
        handlers: {
            heading: customHeadingHandler,
            ...options.remarkRehypeOptions?.handlers,
        },
    };

    const remarkPlugins: PluggableList = [
        remarkSqueezeParagraphs,
        remarkSanitizeAcorn,
        remarkGfm,
        remarkSmartypants,
        remarkMath,
        remarkGemoji,
    ];

    if (options.remarkPlugins != null) {
        remarkPlugins.push(...options.remarkPlugins);
    }

    const rehypePlugins: PluggableList = [
        rehypeSqueezeParagraphs,
        rehypeMdxClassStyle,
        rehypeAcornErrorBoundary,
        rehypeSlug,
        rehypeKatex,
        rehypeFernCode,
        rehypeFernComponents,
        // always extract asides at the end
        rehypeExtractAsides,
    ];

    if (options.rehypePlugins != null) {
        rehypePlugins.push(...options.rehypePlugins);
    }

    // right now, only pages use frontmatterDefaults, so when null, it is implicit that we're serializing a description.
    // if (frontmatterDefaults != null) {
    //     rehypePlugins.push([rehypeFernLayout, { matter: frontmatterDefaults }]);
    // }

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
        useDynamicImport: true,
    };
}

/**
 * Should only be invoked server-side.
 */
export async function serializeMdx(content: string, options?: FernSerializeMdxOptions): Promise<FernDocs.MarkdownText>;
export async function serializeMdx(
    content: string | undefined,
    options?: FernSerializeMdxOptions,
): Promise<FernDocs.MarkdownText | undefined>;
export async function serializeMdx(
    content: string | undefined,
    options?: FernSerializeMdxOptions,
): Promise<FernDocs.MarkdownText | undefined> {
    if (content == null) {
        return undefined;
    }

    // if (options?.frontmatterDefaults == null && !stringHasMarkdown(content)) {
    //     return content;
    // }

    content = sanitizeBreaks(content);
    content = sanitizeMdxExpression(content);

    try {
        const result = await serialize<Record<string, unknown>, FernDocs.Frontmatter>(content, {
            scope: {},
            mdxOptions: withDefaultMdxOptions(options),
            parseFrontmatter: true,
        });

        // TODO: this is doing duplicate work; figure out how to combine it with the compiler above.
        const { jsxElements } = toTree(content);

        return {
            engine: "next-mdx-remote",
            code: result.compiledSource,
            frontmatter: result.frontmatter,
            scope: {},
            jsxRefs: jsxElements,
        };
    } catch (e) {
        // TODO: sentry
        // eslint-disable-next-line no-console
        console.error("Failed to serialize MDX content", e);

        return content;
    }
}
