import type { Options } from "@mdx-js/esbuild";
import { bundleMDX } from "mdx-bundler";
import path from "path";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkGemoji from "remark-gemoji";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkSmartypants from "remark-smartypants";
import { PluggableList } from "unified";
import { FernDocsFrontmatter } from "../frontmatter";
import { rehypeFernCode } from "../plugins/rehypeFernCode";
import { rehypeFernComponents } from "../plugins/rehypeFernComponents";
import { mergeMatter, rehypeFernLayout } from "../plugins/rehypeLayout";
import { customHeadingHandler } from "../plugins/remarkRehypeHandlers";
import type { BundledMDX, FernSerializeMdxOptions } from "../types";
import { replaceBrokenBrTags } from "./replaceBrokenBrTags";

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
    { frontmatterDefaults, options = {}, disableMinify, files }: FernSerializeMdxOptions = {},
): Promise<BundledMDX | undefined> {
    if (content == null) {
        return undefined;
    }

    content = replaceBrokenBrTags(content);

    if (process.platform === "win32") {
        process.env.ESBUILD_BINARY_PATH = path.join(process.cwd(), "node_modules", "esbuild", "esbuild.exe");
    } else {
        process.env.ESBUILD_BINARY_PATH = path.join(process.cwd(), "node_modules", "esbuild", "bin", "esbuild");
    }

    let frontmatter: FernDocsFrontmatter = { ...frontmatterDefaults };

    try {
        const bundled = await bundleMDX<FernDocsFrontmatter>({
            source: content,

            files,

            mdxOptions: (o: Options, matter) => {
                o.remarkRehypeOptions = {
                    ...o.remarkRehypeOptions,
                    ...options,
                    handlers: {
                        ...o.remarkRehypeOptions?.handlers,
                        heading: customHeadingHandler,
                        ...options?.remarkRehypeOptions?.handlers,
                    },
                };

                const remarkPlugins: PluggableList = [remarkGfm, remarkSmartypants, remarkMath, remarkGemoji];

                if (options?.remarkPlugins != null) {
                    remarkPlugins.push(...options.remarkPlugins);
                }

                o.remarkPlugins = [...(o.remarkPlugins ?? []), ...remarkPlugins, ...(options?.remarkPlugins ?? [])];

                const rehypePlugins: PluggableList = [rehypeSlug, rehypeKatex, rehypeFernCode, rehypeFernComponents];

                if (options?.rehypePlugins != null) {
                    rehypePlugins.push(...options.rehypePlugins);
                }

                if (frontmatterDefaults != null) {
                    const opts = {
                        matter: mergeMatter(matter, frontmatterDefaults),
                    };
                    rehypePlugins.push([rehypeFernLayout, opts]);
                    frontmatter = opts.matter;
                } else {
                    frontmatter = mergeMatter(matter, frontmatter);
                }

                // Always sanitize JSX at the end.
                // rehypePlugins.push([rehypeSanitizeJSX, { showError }]);

                o.rehypePlugins = [...(o.rehypePlugins ?? []), ...rehypePlugins, ...(options?.rehypePlugins ?? [])];

                o.recmaPlugins = [...(o.recmaPlugins ?? []), ...(options?.recmaPlugins ?? [])];

                o.development = options.development ?? o.development;

                return o;
            },

            esbuildOptions: (o) => {
                if (disableMinify) {
                    o.minify = false;
                }
                return o;
            },
        });

        if (bundled.errors.length > 0) {
            bundled.errors.forEach((error) => {
                // eslint-disable-next-line no-console
                console.error(error);
            });
        }

        return {
            engine: "mdx-bundler",
            code: bundled.code,
            frontmatter,
            errors: bundled.errors,
        };
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return content;
    }
}
