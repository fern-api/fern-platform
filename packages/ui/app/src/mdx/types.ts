import type { Options } from "@mdx-js/esbuild";
import type { FernDocsFrontmatter } from "./frontmatter";

interface BundledMDXResult {
    engine: MdxEngine;
    code: string;
    frontmatter: FernDocsFrontmatter;
    errors: any[];
}

export type BundledMDX = BundledMDXResult | string;

export type FernSerializeMdxOptions = {
    filename?: string;
    frontmatterDefaults?: FernDocsFrontmatter;
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
) => Promise<BundledMDX | undefined>;

export type MdxEngine = "mdx-bundler" | "next-mdx-remote";
