import "server-only";

import { mapKeys } from "es-toolkit/object";
import { bundleMDX } from "mdx-bundler";
import path, { dirname } from "path";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGemoji from "remark-gemoji";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkSmartypants from "remark-smartypants";
import remarkSqueezeParagraphs from "remark-squeeze-paragraphs";

import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { EMPTY_FRONTMATTER } from "@fern-api/fdr-sdk/docs";
import {
  type PluggableList,
  customHeadingHandler,
  getFrontmatter,
  sanitizeBreaks,
  sanitizeMdxExpression,
  toTree,
} from "@fern-docs/mdx";
import {
  rehypeAcornErrorBoundary,
  rehypeMdxClassStyle,
  rehypeSqueezeParagraphs,
  rehypeToc,
  remarkInjectEsm,
  remarkMarkAndUnravel,
  remarkSanitizeAcorn,
} from "@fern-docs/mdx/plugins";

import { RehypeFilesOptions, rehypeFiles } from "../plugins/rehype-files";
import { rehypeFernCode } from "../plugins/rehypeFernCode";
import { rehypeFernComponents } from "../plugins/rehypeFernComponents";
import { remarkExtractTitle } from "../plugins/remark-extract-title";

export type FernSerializeMdxOptions = {
  filename?: string;
  files?: Record<string, string>;
  scope?: Record<string, unknown>;
  replaceSrc?: RehypeFilesOptions["replaceSrc"];
  /**
   * @default false
   */
  showError?: boolean;
  /**
   * @default false
   */
  stripParagraph?: boolean;
  /**
   * @default false
   */
  toc?: boolean;
};

/**
 * Should only be invoked server-side.
 */

async function serializeMdxImpl(
  content: string | undefined,
  {
    files,
    filename,
    scope = {},
    replaceSrc,
    toc = false,
    stripParagraph = false,
  }: FernSerializeMdxOptions = {}
): Promise<FernDocs.ResolvedMdx | undefined> {
  if (!content?.trimStart().length) {
    return undefined;
  }

  content = sanitizeBreaks(content);
  content = sanitizeMdxExpression(content)[0];

  let cwd: string | undefined;
  if (filename != null) {
    try {
      cwd = dirname(filename);
    } catch {
      console.error("Failed to get cwd from filename", filename);
    }
  }

  const parseFrontmatter = content.trimStart().startsWith("---\n");

  const frontmatter = parseFrontmatter
    ? getFrontmatter(content).data
    : { ...EMPTY_FRONTMATTER };

  const bundled = await bundleMDX({
    source: content + "\n\n",
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

    mdxOptions: (o) => {
      o.remarkRehypeOptions = {
        handlers: {
          heading: customHeadingHandler,
        },
      };

      o.providerImportSource = "@mdx-js/react";

      const remarkPlugins: PluggableList = [
        remarkFrontmatter,
        [remarkMdxFrontmatter, { name: "frontmatter" }],
        remarkMarkAndUnravel,
        [remarkExtractTitle, { frontmatter }],
        remarkSqueezeParagraphs,
        [remarkInjectEsm, { scope }],
        [remarkSanitizeAcorn],
        remarkGfm,
        remarkSmartypants,
        remarkMath,
        remarkGemoji,
      ];

      const rehypePlugins: PluggableList = [
        [rehypeSqueezeParagraphs, { stripParagraph }],
        rehypeMdxClassStyle,
        [rehypeFiles, { replaceSrc }],
        rehypeAcornErrorBoundary,
        rehypeSlug,
        rehypeKatex,
        rehypeFernCode,
        rehypeFernComponents,
        // // always extract asides at the end
        // rehypeExtractAsides,
      ];

      if (toc) {
        rehypePlugins.unshift(rehypeToc);
      }

      o.remarkPlugins = remarkPlugins;
      o.rehypePlugins = rehypePlugins;

      o.development = process.env.NODE_ENV === "development";

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
    console.debug("content", content, "code", bundled.code);
  }

  // TODO: this is doing duplicate work; figure out how to combine it with the compiler above.
  const { jsxElements } = toTree(content, { sanitize: false });

  return {
    code: bundled.code,
    frontmatter,
    scope: {},
    jsxRefs: jsxElements,
  };
}

export async function serializeMdx(
  content: string | undefined,
  options: FernSerializeMdxOptions = {}
) {
  try {
    return await serializeMdxImpl(content, options);
  } catch (error) {
    console.error(error);
    console.debug("Failed to serialize:", content);
    return undefined;
  }
}
