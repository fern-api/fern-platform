import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { customHeadingHandler } from "@fern-ui/fern-docs-mdx";
import type { Options } from "@mdx-js/esbuild";
import { mapKeys } from "es-toolkit/object";
import { bundleMDX } from "mdx-bundler";
import path, { dirname } from "path";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkGemoji from "remark-gemoji";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkSmartypants from "remark-smartypants";
import { PluggableList } from "unified";
import { rehypeFernCode } from "../plugins/rehypeFernCode";
import { rehypeFernComponents } from "../plugins/rehypeFernComponents";
import { mergeMatter, rehypeFernLayout } from "../plugins/rehypeLayout";
import { rehypeSqueezeParagraphs } from "../plugins/rehypeSqueezeParagraphs";
import { remarkSqueezeParagraphs } from "../plugins/remarkSqueezeParagraphs";
import type { FernSerializeMdxOptions } from "../types";
import { replaceBrokenBrTags } from "./replaceBrokenBrTags";

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
    { frontmatterDefaults, options = {}, disableMinify, files, filename }: FernSerializeMdxOptions = {},
): Promise<FernDocs.MarkdownText | undefined> {
    if (content == null) {
        return undefined;
    }

    content = replaceBrokenBrTags(content);

    if (process.platform === "win32") {
        process.env.ESBUILD_BINARY_PATH = path.join(process.cwd(), "node_modules", "esbuild", "esbuild.exe");
    } else {
        process.env.ESBUILD_BINARY_PATH = path.join(process.cwd(), "node_modules", "esbuild", "bin", "esbuild");
    }

    let frontmatter: Partial<FernDocs.Frontmatter> = { ...frontmatterDefaults };

    let cwd: string | undefined;
    if (filename != null) {
        try {
            cwd = dirname(filename);
        } catch {
            // eslint-disable-next-line no-console
            console.error("Failed to get cwd from filename", filename);
        }
    }

    try {
        const bundled = await bundleMDX<FernDocs.Frontmatter>({
            source: content,
            files: mapKeys(files ?? {}, (_file, filename) => {
                if (cwd != null) {
                    return path.relative(cwd, filename);
                }
                return filename;
            }),

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

                const remarkPlugins: PluggableList = [
                    remarkSqueezeParagraphs,
                    remarkGfm,
                    remarkSmartypants,
                    remarkMath,
                    remarkGemoji,
                ];

                if (options?.remarkPlugins != null) {
                    remarkPlugins.push(...options.remarkPlugins);
                }

                o.remarkPlugins = [...(o.remarkPlugins ?? []), ...remarkPlugins, ...(options?.remarkPlugins ?? [])];

                const rehypePlugins: PluggableList = [
                    rehypeSqueezeParagraphs,
                    rehypeSlug,
                    rehypeKatex,
                    rehypeFernCode,
                    rehypeFernComponents,
                ];

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
                o.minify = disableMinify ? false : true;
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
            // this casting is ok because Partial<FernDocs.Frontmatter> satisfies FernDocs.Frontmatter
            frontmatter: frontmatter as FernDocs.Frontmatter,
            scope: {},
        };
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return content;
    }
}
