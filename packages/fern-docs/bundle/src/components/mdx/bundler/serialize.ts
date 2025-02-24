import "server-only";

import { mapKeys } from "es-toolkit/object";
import { bundleMDX } from "mdx-bundler";
import path from "path";
import rehypeKatex from "rehype-katex";
import remarkFrontmatter from "remark-frontmatter";
import remarkGemoji from "remark-gemoji";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkSmartypants from "remark-smartypants";
import remarkSqueezeParagraphs from "remark-squeeze-paragraphs";
import { noop } from "ts-essentials";

import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import {
  type PluggableList,
  customHeadingHandler,
  sanitizeBreaks,
  sanitizeMdxExpression,
} from "@fern-docs/mdx";
import {
  rehypeAcornErrorBoundary,
  rehypeMdxClassStyle,
  rehypeSlug,
  rehypeToc,
  remarkInjectEsm,
  remarkSanitizeAcorn,
} from "@fern-docs/mdx/plugins";

import { DocsLoader } from "@/server/docs-loader";
import { FileData } from "@/server/types";

import { getMDXExport } from "../get-mdx-export";
import { rehypeAccordions } from "../plugins/rehype-accordions";
import { rehypeButtons } from "../plugins/rehype-buttons";
import { rehypeCards } from "../plugins/rehype-cards";
import { rehypeCodeBlock } from "../plugins/rehype-code-block";
import { rehypeCollectJsx } from "../plugins/rehype-collect-jsx";
import { rehypeEndpointSnippets } from "../plugins/rehype-endpoint-snippets";
import { rehypeExtractAsides } from "../plugins/rehype-extract-asides";
import { rehypeFiles } from "../plugins/rehype-files";
import { rehypeMigrateJsx } from "../plugins/rehype-migrate-jsx";
import { rehypeSteps } from "../plugins/rehype-steps";
import { rehypeTabs } from "../plugins/rehype-tabs";
import { remarkExtractTitle } from "../plugins/remark-extract-title";

async function serializeMdxImpl(
  content: string,
  {
    loader,
    filename,
    scope,
    toc = false,
  }: {
    loader?: DocsLoader;
    scope?: Record<string, unknown>;
    filename?: string;
    toc?: boolean;
  } = {}
): Promise<{
  code: string;
  frontmatter?: Partial<FernDocs.Frontmatter>;
  jsxElements: string[];
}> {
  content = sanitizeBreaks(content);
  content = sanitizeMdxExpression(content)[0];

  let cwd: string | undefined;
  if (filename != null) {
    try {
      cwd = path.dirname(filename);
    } catch {
      console.error("Failed to get cwd from filename", filename);
    }
  }

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

  let files: Record<string, string> = {};
  let remoteFiles: Record<string, FileData> = {};
  const jsxElements: string[] = [];

  if (loader != null) {
    remoteFiles = await loader.getFiles();

    if (filename != null) {
      files = await loader.getMdxBundlerFiles();
    }
  }

  const bundled = await bundleMDX({
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

    mdxOptions: (o) => {
      o.remarkRehypeOptions = {
        handlers: { heading: customHeadingHandler },
      };

      o.providerImportSource = "@mdx-js/react";

      const remarkPlugins: PluggableList = [
        remarkFrontmatter,
        remarkExtractTitle,
        [remarkMdxFrontmatter, { name: "frontmatter" }],
        remarkSqueezeParagraphs,
        [remarkInjectEsm, { scope }],
        [remarkSanitizeAcorn],
        remarkGfm,
        remarkSmartypants,
        remarkMath,
        remarkGemoji,
      ];

      const rehypePlugins: PluggableList = [
        rehypeKatex,
        [rehypeFiles, { files: remoteFiles }],
        rehypeMdxClassStyle,
        rehypeCodeBlock,
        rehypeSteps,
        rehypeAccordions,
        rehypeTabs,
        rehypeCards,
        [
          rehypeSlug,
          { additionalJsxElements: ["Step", "Accordion", "Tab", "Card"] },
        ],
        rehypeButtons,
        [rehypeEndpointSnippets, { loader }],
        [
          rehypeMigrateJsx,
          {
            a: "A",
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
        ],
        rehypeExtractAsides,
        toc ? rehypeToc : noop,
        rehypeAcornErrorBoundary,
        [
          rehypeCollectJsx,
          {
            collect: (jsxElements_: string[]) => {
              jsxElements.push(...jsxElements_);
            },
          },
        ],
      ];

      o.remarkPlugins = remarkPlugins;
      o.rehypePlugins = rehypePlugins;

      o.development = process.env.NODE_ENV === "development";

      return o;
    },

    esbuildOptions: (o) => {
      o.minify = process.env.NODE_ENV === "production";
      o.sourcemap = false;
      return o;
    },
  });

  if (bundled.errors.length > 0) {
    bundled.errors.forEach((error) => {
      console.error(error);
    });
    console.debug("content", content, "code", bundled.code);
  }

  const frontmatter = getMDXExport(bundled)?.frontmatter as
    | Partial<FernDocs.Frontmatter>
    | undefined;

  // TODO: this is doing duplicate work; figure out how to combine it with the compiler above.
  // const { jsxElements } = toTree(content, { sanitize: false });

  return { code: bundled.code, frontmatter, jsxElements };
}

export async function serializeMdx(
  content: string | undefined,
  options?: Parameters<typeof serializeMdxImpl>[1]
) {
  if (!content?.trimStart().length) {
    return undefined;
  }
  try {
    return await serializeMdxImpl(content, options);
  } catch (error) {
    console.error(String(error));
    console.debug("Failed to serialize:", content);
    return undefined;
  }
}
