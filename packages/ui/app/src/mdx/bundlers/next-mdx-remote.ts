import { serialize } from "next-mdx-remote/serialize";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkGemoji from "remark-gemoji";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkSmartypants from "remark-smartypants";
import type { PluggableList } from "unified";
import { stringHasMarkdown } from "../common/util";
import { FernDocsFrontmatter } from "../frontmatter";
import { rehypeFernCode } from "../plugins/rehypeFernCode";
import { rehypeFernComponents } from "../plugins/rehypeFernComponents";
import { rehypeFernLayout } from "../plugins/rehypeLayout";
import { rehypeSanitizeJSX } from "../plugins/rehypeSanitizeJSX";
import { rehypeSqueezeParagraphs } from "../plugins/rehypeSqueezeParagraphs";
import { customHeadingHandler } from "../plugins/remarkRehypeHandlers";
import { remarkSqueezeParagraphs } from "../plugins/remarkSqueezeParagraphs";
import type { BundledMDX, FernSerializeMdxOptions } from "../types";
import { replaceBrokenBrTags } from "./replaceBrokenBrTags";

type SerializeOptions = NonNullable<Parameters<typeof serialize>[1]>;

function withDefaultMdxOptions({
    frontmatterDefaults,
    showError = process.env.NODE_ENV === "development",
    options = {},
}: FernSerializeMdxOptions = {}): SerializeOptions["mdxOptions"] {
    const remarkRehypeOptions = {
        ...options.remarkRehypeOptions,
        handlers: {
            heading: customHeadingHandler,
            ...options.remarkRehypeOptions?.handlers,
        },
    };

    const remarkPlugins: PluggableList = [
        remarkSqueezeParagraphs,
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
        rehypeSlug,
        rehypeKatex,
        rehypeFernCode,
        rehypeFernComponents,
    ];

    if (options.rehypePlugins != null) {
        rehypePlugins.push(...options.rehypePlugins);
    }

    // right now, only pages use frontmatterDefaults, so when null, it is implicit that we're serializing a description.
    if (frontmatterDefaults != null) {
        rehypePlugins.push([rehypeFernLayout, { matter: frontmatterDefaults }]);
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
        useDynamicImport: true,
    };
}

/**
 * Should only be invoked server-side.
 */
export async function serializeMdx(content: string, options?: FernSerializeMdxOptions): Promise<BundledMDX>;
export async function serializeMdx(
    content: string | undefined,
    options?: FernSerializeMdxOptions,
): Promise<BundledMDX | undefined>;
export async function serializeMdx(
    content: string | undefined,
    options?: FernSerializeMdxOptions,
): Promise<BundledMDX | undefined> {
    if (content == null) {
        return undefined;
    }

    if (options?.frontmatterDefaults == null && !stringHasMarkdown(content)) {
        return content;
    }

    content = replaceBrokenBrTags(content);

    const result = await serialize<Record<string, unknown>, FernDocsFrontmatter>(content, {
        scope: {},
        mdxOptions: withDefaultMdxOptions(options),
        parseFrontmatter: true,
    });

    return {
        engine: "next-mdx-remote",
        code: result.compiledSource,
        frontmatter: result.frontmatter,
        errors: [],
    };
}
