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
import { rehypeFernCode } from "./plugins/rehypeFernCode";
import { rehypeFernComponents } from "./plugins/rehypeFernComponents";
import { PageHeaderProps, rehypeFernLayout } from "./plugins/rehypeLayout";
import { rehypeSanitizeJSX } from "./plugins/rehypeSanitizeJSX";
import { customHeadingHandler } from "./plugins/remarkRehypeHandlers";

/**
 * The layout used for guides. This is the default layout.
 * Guides are typically long-form content that is meant to be read from start to finish.
 */
type GuideLayout = "guide";

/**
 * Overview pages are typically meant to be a landing page for a section of the documentation.
 * These pages are 50% wider than guide pages, but the table of contents is still visible.
 */
type OverviewLayout = "overview";

/**
 * Reference pages are best used for API docs or other material that is meant to have a right-hand column.
 * Refrence pages are 2x the width of guide pages, and should be paired with <Aside> component.
 * Aside will generate a sticky right-hand column for the page, which is useful for code snippets.
 * Table of contents are always hidden on reference pages.
 */
type ReferenceLayout = "reference";

/**
 * The layout used for full-width pages. This is useful for landing pages or other custom layouts.
 * Both the navigation sidebar and the table of contents are hidden.
 * The content will take up the full width of the page-width container, which is set by docs.yml.
 */
type PageLayout = "page";

/**
 * This layout takes over 100% of the viewport width, below the header.
 * Unlike PageLayout, the content will not be constrained to the page-width container, and does not have padding.
 */
type CustomLayout = "custom";

type Layout = GuideLayout | OverviewLayout | ReferenceLayout | PageLayout | CustomLayout;

export interface FernDocsFrontmatter extends DocsV1Read.MetadataConfig {
    /**
     * The layout of the page. This will determine the width of the content.
     * Defaults to "guide"
     */
    layout?: Layout;

    /**
     * The title of the page. If not set, the title will inherit what's set in the sidebar.
     * This is also used for the <title> tag in the HTML.
     */
    title?: string;

    /**
     * The description of the page. This is used for the <meta name="description"> tag in the HTML.
     */
    description?: string;

    /**
     * The subtitle of the page. This is a markdown string that is rendered below the title.
     * If `description` is not set, this will be used for the <meta name="description"> tag in the HTML.
     */
    subtitle?: string;

    /**
     * The URL to the page's image. This is used for the <meta property="og:image"> tag in the HTML.
     */
    image?: string;

    /**
     * Renders an "Edit this page" link at the bottom of the page.
     */
    "edit-this-page-url"?: string;

    /**
     * Hides the table of contents.
     */
    "hide-toc"?: boolean;

    /**
     * Hides the (prev, next) navigation links at the bottom of the page.
     */
    "hide-nav-links"?: boolean;

    /**
     * Hides the feedback form at the bottom of the page.
     */
    "hide-feedback"?: boolean;

    // deprecated:
    editThisPageUrl?: string; // use "edit-this-page-url" instead
    excerpt?: string; // use subtitle instead
}

export type SerializedMdxContent = MDXRemoteSerializeResult<Record<string, unknown>, FernDocsFrontmatter> | string;

type SerializeOptions = NonNullable<Parameters<typeof serialize>[1]>;

type SerializeMdxOptions = SerializeOptions["mdxOptions"];

export type FernSerializeMdxOptions = SerializeMdxOptions & {
    pageHeader?: PageHeaderProps;
    showError?: boolean;
};

function withDefaultMdxOptions({
    pageHeader,
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

    if (pageHeader != null) {
        rehypePlugins.push([rehypeFernLayout, pageHeader]);
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
