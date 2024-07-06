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
import { FernDocsFrontmatter } from "./frontmatter";
import { rehypeFernCode } from "./plugins/rehypeFernCode";
import { rehypeFernComponents } from "./plugins/rehypeFernComponents";
import { rehypeFernLayout } from "./plugins/rehypeLayout";
import { rehypeSanitizeJSX } from "./plugins/rehypeSanitizeJSX";
import { customHeadingHandler } from "./plugins/remarkRehypeHandlers";

interface BundledMDXResult {
    code: string;
    frontmatter: FernDocsFrontmatter;
    errors: any[];
}

export type BundledMDX = BundledMDXResult | string;

export type FernSerializeMdxOptions = {
    defaultFrontmatter?: FernDocsFrontmatter;
    showError?: boolean;
    options?: Options;
};

export async function serializeMdx(content: string, options?: FernSerializeMdxOptions): Promise<BundledMDX>;
export async function serializeMdx(
    content: string | undefined,
    options?: FernSerializeMdxOptions,
): Promise<BundledMDX | undefined>;
export async function serializeMdx(
    content: string | undefined,
    { defaultFrontmatter, showError, options = {} }: FernSerializeMdxOptions = {},
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

    let fm: FernDocsFrontmatter = {};

    try {
        const bundled = await bundleMDX<FernDocsFrontmatter>({
            source: content,

            mdxOptions: (o: Options, frontmatter: FernDocsFrontmatter) => {
                fm = { ...defaultFrontmatter, ...frontmatter };

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

                if (defaultFrontmatter != null) {
                    rehypePlugins.push([rehypeFernLayout, fm]);
                }

                // Always sanitize JSX at the end.
                rehypePlugins.push([rehypeSanitizeJSX, { showError }]);

                o.rehypePlugins = [...(o.rehypePlugins ?? []), ...rehypePlugins, ...(options?.rehypePlugins ?? [])];

                o.recmaPlugins = [...(o.recmaPlugins ?? []), ...(options?.recmaPlugins ?? [])];

                o.development = options.development ?? o.development;

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
            code: bundled.code,
            frontmatter: fm,
            errors: bundled.errors,
        };
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return content;
    }
}

export function replaceBrokenBrTags(content: string): string {
    return content.replaceAll(/<br\s*\/?>/g, "<br />").replaceAll("</br>", "");
}
