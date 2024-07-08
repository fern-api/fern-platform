import type { Options } from "@mdx-js/esbuild";
import type { FernDocsFrontmatter } from "./frontmatter";

interface BundledMDXResult {
    code: string;
    frontmatter: FernDocsFrontmatter;
    errors: any[];
}

export type BundledMDX = BundledMDXResult | string;

export type FernSerializeMdxOptions = {
    frontmatterOverrides?: FernDocsFrontmatter;
    showError?: boolean;
    options?: Options;
};

export type SerializeMdxFunc = (
    content: string | undefined,
    options?: FernSerializeMdxOptions,
) => Promise<BundledMDX | undefined>;

export type MdxEngine = "mdx-bundler" | "next-mdx-remote";
