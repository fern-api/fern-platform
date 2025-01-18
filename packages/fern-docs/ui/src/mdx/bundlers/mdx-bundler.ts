import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import {
  customHeadingHandler,
  sanitizeBreaks,
  sanitizeMdxExpression,
  toTree,
} from "@fern-docs/mdx";
import {
  rehypeAcornErrorBoundary,
  rehypeMdxClassStyle,
  rehypeSlug,
  rehypeSqueezeParagraphs,
  remarkSanitizeAcorn,
  remarkSqueezeParagraphs,
} from "@fern-docs/mdx/plugins";
import type { Options } from "@mdx-js/esbuild";
import { mapKeys } from "es-toolkit/object";
import { bundleMDX } from "mdx-bundler";
import path, { dirname } from "path";
import rehypeKatex from "rehype-katex";
import remarkGemoji from "remark-gemoji";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkSmartypants from "remark-smartypants";
import { PluggableList } from "unified";
import { rehypeExtractAsides } from "../plugins/rehype-extract-asides";
import { rehypeFernCode } from "../plugins/rehype-fern-code";
import { rehypeJsxAlias } from "../plugins/rehype-jsx-alias";
import { rehypeMigrateSteps } from "../plugins/rehype-migrate-steps";
import { rehypeSlugJsxElementVisitor } from "../plugins/rehype-slug-visitor";
import type { FernSerializeMdxOptions } from "../types";

/**
 * Should only be invoked server-side.
 */
export async function serializeMdx(
  content: string,
  options?: FernSerializeMdxOptions
): Promise<FernDocs.MarkdownText>;
export async function serializeMdx(
  content: string | undefined,
  options?: FernSerializeMdxOptions
): Promise<FernDocs.MarkdownText | undefined>;
export async function serializeMdx(
  content: string | undefined,
  { options = {}, files, filename, scope = {} }: FernSerializeMdxOptions = {}
): Promise<FernDocs.MarkdownText | undefined> {
  if (content == null) {
    return undefined;
  }

  content = sanitizeBreaks(content);
  content = sanitizeMdxExpression(content);

  if (process.platform === "win32") {
    process.env.ESBUILD_BINARY_PATH = path.join(
      process.cwd(),
      "node_modules",
      "esbuild",
      "esbuild.exe"
    );
  } else {
    process.env.ESBUILD_BINARY_PATH = path.join(
      process.cwd(),
      "node_modules",
      "esbuild",
      "bin",
      "esbuild"
    );
  }

  let cwd: string | undefined;
  if (filename != null) {
    try {
      cwd = dirname(filename);
    } catch {
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

      globals: {
        "@mdx-js/react": {
          varName: "MdxJsReact",
          namedExports: ["useMDXComponents"],
          defaultExport: false,
        },
      },

      mdxOptions: (o: Options) => {
        o.remarkRehypeOptions = {
          ...o.remarkRehypeOptions,
          ...options,
          handlers: {
            ...o.remarkRehypeOptions?.handlers,
            heading: customHeadingHandler,
            ...options?.remarkRehypeOptions?.handlers,
          },
        };

        o.providerImportSource = "@mdx-js/react";

        const remarkPlugins: PluggableList = [
          remarkSqueezeParagraphs,
          remarkSanitizeAcorn,
          remarkGfm,
          remarkSmartypants,
          remarkMath,
          remarkGemoji,
        ];

        if (options?.remarkPlugins != null) {
          remarkPlugins.push(...options.remarkPlugins);
        }

        o.remarkPlugins = [
          ...(o.remarkPlugins ?? []),
          ...remarkPlugins,
          ...(options?.remarkPlugins ?? []),
        ];

        const rehypePlugins: PluggableList = [
          rehypeSqueezeParagraphs,
          rehypeMdxClassStyle,
          rehypeAcornErrorBoundary,
          rehypeKatex,
          rehypeFernCode,
          [
            rehypeJsxAlias,
            {
              aliases: {
                a: "A",
                embed: "Embed",
                h1: "H1",
                h2: "H2",
                h3: "H3",
                h4: "H4",
                h5: "H5",
                h6: "H6",
                img: "Image",
                li: "Li",
                ol: "Ol",
                strong: "Strong",
                table: "Table",
                ul: "Ul",
              },
            },
          ],
          rehypeMigrateSteps,
          [rehypeSlug, { visitJsxElement: rehypeSlugJsxElementVisitor }],
          // always extract asides at the end
          rehypeExtractAsides,
        ];

        if (options?.rehypePlugins != null) {
          rehypePlugins.push(...options.rehypePlugins);
        }

        o.rehypePlugins = [
          ...(o.rehypePlugins ?? []),
          ...rehypePlugins,
          ...(options?.rehypePlugins ?? []),
        ];

        o.recmaPlugins = [
          ...(o.recmaPlugins ?? []),
          ...(options?.recmaPlugins ?? []),
        ];

        o.development = options.development ?? o.development;

        return o;
      },

      esbuildOptions: (o) => {
        o.minify = process.env.NODE_ENV === "production";
        return o;
      },
    });

    if (bundled.errors.length > 0) {
      bundled.errors.forEach((error) => {
        console.error(error);
      });
    }

    // TODO: this is doing duplicate work; figure out how to combine it with the compiler above.
    const { jsxElements } = toTree(content, { sanitize: false });
    return {
      engine: "mdx-bundler",
      code: bundled.code,
      frontmatter: bundled.frontmatter,
      scope,
      jsxRefs: jsxElements,
    };
  } catch (e) {
    console.error(e);
    return content;
  }
}
