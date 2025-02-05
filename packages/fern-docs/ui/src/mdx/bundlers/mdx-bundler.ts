import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import {
  customHeadingHandler,
  sanitizeBreaks,
  sanitizeMdxExpression,
  toTree,
  type PluggableList,
} from "@fern-docs/mdx";
import {
  rehypeAcornErrorBoundary,
  rehypeMdxClassStyle,
  rehypeSqueezeParagraphs,
  remarkInjectEsm,
  remarkSanitizeAcorn,
  remarkSqueezeParagraphs,
} from "@fern-docs/mdx/plugins";
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
import { rehypeFiles } from "../plugins/rehype-files";
import { rehypeExtractAsides } from "../plugins/rehypeExtractAsides";
import { rehypeFernCode } from "../plugins/rehypeFernCode";
import { rehypeFernComponents } from "../plugins/rehypeFernComponents";
import { remarkExtractTitle } from "../plugins/remark-extract-title";
import type { FernSerializeMdxOptions } from "../types";

/**
 * Should only be invoked server-side.
 */
async function serializeMdxImpl(
  content: string,
  options?: FernSerializeMdxOptions
): Promise<FernDocs.MarkdownText>;
async function serializeMdxImpl(
  content: string | undefined,
  options?: FernSerializeMdxOptions
): Promise<FernDocs.MarkdownText | undefined>;
async function serializeMdxImpl(
  content: string | undefined,
  {
    options = {},
    files,
    filename,
    scope = {},
    replaceSrc,
  }: FernSerializeMdxOptions = {}
): Promise<FernDocs.MarkdownText | undefined> {
  if (content == null) {
    return undefined;
  }

  content = sanitizeBreaks(content);
  content = sanitizeMdxExpression(content)[0];

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

    mdxOptions: (o: Options, frontmatter) => {
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
        [remarkExtractTitle, { frontmatter }],
        remarkSqueezeParagraphs,
        [remarkInjectEsm, { scope }],
        [remarkSanitizeAcorn],
        remarkGfm,
        remarkSmartypants,
        remarkMath,
        remarkGemoji,
      ];

      // inject scope variables
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
        [rehypeFiles, { replaceSrc }],
        rehypeAcornErrorBoundary,
        rehypeSlug,
        rehypeKatex,
        rehypeFernCode,
        rehypeFernComponents,
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
    scope: {},
    jsxRefs: jsxElements,
  };
}

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
  options?: FernSerializeMdxOptions
): Promise<FernDocs.MarkdownText | undefined> {
  let attempts = 0;
  while (attempts < 3) {
    try {
      return await serializeMdxImpl(content, options);
    } catch (e) {
      // TODO: emit this error to Sentry
      console.error(e);
    }
    attempts++;
    // exponential backoff
    await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
  }
  return content;
}
