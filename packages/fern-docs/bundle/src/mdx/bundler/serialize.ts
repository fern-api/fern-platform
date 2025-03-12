import "server-only";

import { mapKeys } from "es-toolkit/object";
import fs from "fs";
import { gracefulify } from "graceful-fs";
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
  Hast,
  type PluggableList,
  customHeadingHandler,
  sanitizeBreaks,
  sanitizeMdxExpression,
} from "@fern-docs/mdx";
import {
  rehypeAcornErrorBoundary,
  rehypeExpressionToMd,
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

// gracefulify fs to avoid EMFILE errors on Vercel
gracefulify(fs);

export interface SerializeMdxResponse {
  code: string;
  frontmatter?: Partial<FernDocs.Frontmatter>;
  jsxElements: string[];
}

async function serializeMdxImpl(
  content: string,
  {
    loader,
    filename,
    scope,
    toc = false,
  }: {
    loader?: Partial<Pick<DocsLoader, "getFiles" | "getMdxBundlerFiles">>;
    scope?: Record<string, unknown>;
    filename?: string;
    toc?: boolean;
  } = {}
): Promise<SerializeMdxResponse> {
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

  remoteFiles = (await loader?.getFiles?.()) ?? {};
  files = (await loader?.getMdxBundlerFiles?.()) ?? {};
  files = mapKeys(files ?? {}, (_file, filename) => {
    if (cwd != null) {
      return path.relative(cwd, filename);
    }
    return filename;
  });

  const bundled = await bundleMDX({
    source: content,
    files,

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
        [rehypeSlug, { additionalJsxElements: ["Step", "Accordion", "Tab"] }],
        [
          rehypeExpressionToMd,
          {
            mdxJsxElementAllowlist: {
              Frame: ["caption"],
              Tab: ["title"],
              Card: ["title"],
              Callout: ["title"],
              Step: ["title"],
              Accordion: ["title"],
            },
          },
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

        rehypeExtractAsides,
        rehypeLog,
      ];

      o.remarkPlugins = remarkPlugins;
      o.rehypePlugins = rehypePlugins;

      o.development = process.env.NODE_ENV === "development";

      return o;
    },

    esbuildOptions: (o) => {
      o.minify = process.env.NODE_ENV === "production";
      o.sourcemap = false;

      o.logLevel = "error"; // Reduce logging overhead

      o.logLimit = 0; // Disable logging to reduce file operations
      o.metafile = false; // Don't generate metafile (reduces file operations)

      // Add write to memory instead of disk when possible
      o.write = false;
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

export function serializeMdx(
  content: string | undefined,
  options?: Parameters<typeof serializeMdxImpl>[1]
): Promise<SerializeMdxResponse | undefined> {
  const abortController = new AbortController();
  const { signal } = abortController;

  return new Promise<SerializeMdxResponse | undefined>((resolve, reject) => {
    if (!content?.trimStart().length) {
      resolve(undefined);
      return;
    }

    const timeoutId = setTimeout(() => {
      if (!signal.aborted) {
        abortController.abort();
        console.error("Serialize MDX timed out after 10 seconds");
        reject(new Error("Serialize MDX timed out"));
      }
    }, 60_000);

    serializeMdxImpl(content, { ...options }).then(
      (result) => {
        clearTimeout(timeoutId);
        resolve(result);
      },
      (error: unknown) => {
        clearTimeout(timeoutId);
        reject(error instanceof Error ? error : new Error(String(error)));
        console.error(error);
      }
    );
  });
}

// uncomment this to log the tree to the console in localhost only (DO NOT COMMIT)
function rehypeLog() {
  return (_tree: Hast.Root) => {
    // console.debug(JSON.stringify(tree));
  };
}
