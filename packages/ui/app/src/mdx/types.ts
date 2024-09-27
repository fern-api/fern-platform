import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import type { Options } from "@mdx-js/esbuild";

export type FernSerializeMdxOptions = {
    parseFrontmatter?: boolean; // default: true
    filename?: string;
    frontmatterDefaults?: Partial<FernDocs.Frontmatter>;
    showError?: boolean;
    options?: Options;

    // for testing purposes
    // next-mdx-remote doesn't support minification, while mdx-bundler does by default
    disableMinify?: boolean;

    files?: Record<string, string>;
};

export type SerializeMdxFunc = (
    content: string | undefined,
    options?: FernSerializeMdxOptions,
) => Promise<FernDocs.MarkdownText | undefined>;
