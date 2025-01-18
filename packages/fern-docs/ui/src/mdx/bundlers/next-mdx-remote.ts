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
import { serialize } from "next-mdx-remote/serialize";
import rehypeKatex from "rehype-katex";
import remarkGemoji from "remark-gemoji";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkSmartypants from "remark-smartypants";
import type { PluggableList } from "unified";
import { rehypeExtractAsides } from "../plugins/rehype-extract-asides";
import { rehypeFernCode } from "../plugins/rehype-fern-code";
import { rehypeJsxAlias } from "../plugins/rehype-jsx-alias";
import { rehypeMigrateSteps } from "../plugins/rehype-migrate-steps";
import { rehypeSlugJsxElementVisitor } from "../plugins/rehype-slug-visitor";
import type { FernSerializeMdxOptions } from "../types";

type SerializeOptions = NonNullable<Parameters<typeof serialize>[1]>;

function withDefaultMdxOptions({
  options = {},
}: FernSerializeMdxOptions = {}): SerializeOptions["mdxOptions"] {
  const remarkRehypeOptions = {
    ...options.remarkRehypeOptions,
    handlers: {
      heading: customHeadingHandler,
      ...options.remarkRehypeOptions?.handlers,
    },
  };

  const remarkPlugins: PluggableList = [
    remarkSqueezeParagraphs,
    remarkSanitizeAcorn,
    remarkGfm,
    remarkSmartypants,
    remarkMath,
    remarkGemoji,
  ];

  if (options.remarkPlugins != null) {
    remarkPlugins.push(...options.remarkPlugins);
  }

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
    // slugify ids after rehypeFernComponents so that we can generate ids for <Step> components
    [rehypeSlug, { visitJsxElement: rehypeSlugJsxElementVisitor }],
    // always extract asides at the end
    rehypeExtractAsides,
  ];

  if (options.rehypePlugins != null) {
    rehypePlugins.push(...options.rehypePlugins);
  }

  // right now, only pages use frontmatterDefaults, so when null, it is implicit that we're serializing a description.
  // if (frontmatterDefaults != null) {
  //     rehypePlugins.push([rehypeFernLayout, { matter: frontmatterDefaults }]);
  // }

  return {
    /**
     * development=true is required to render MdxRemote from the client-side.
     * https://github.com/hashicorp/next-mdx-remote/issues/350
     */
    development: process.env.NODE_ENV !== "production",
    ...options,
    remarkRehypeOptions,
    remarkPlugins,
    rehypePlugins,
    format: "mdx",
    useDynamicImport: true,
  };
}

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
  options?: FernSerializeMdxOptions
): Promise<FernDocs.MarkdownText | undefined> {
  if (content == null) {
    return undefined;
  }

  // if (options?.frontmatterDefaults == null && !stringHasMarkdown(content)) {
  //     return content;
  // }

  content = sanitizeBreaks(content);
  content = sanitizeMdxExpression(content);

  try {
    const result = await serialize<
      Record<string, unknown>,
      FernDocs.Frontmatter
    >(content, {
      scope: options?.scope,
      mdxOptions: withDefaultMdxOptions(options),
      parseFrontmatter: true,
    });

    // TODO: this is doing duplicate work; figure out how to combine it with the compiler above.
    const { jsxElements } = toTree(content, { sanitize: false });

    return {
      engine: "next-mdx-remote",
      code: result.compiledSource,
      frontmatter: result.frontmatter,
      scope: result.scope,
      jsxRefs: jsxElements,
    };
  } catch (e) {
    // TODO: sentry

    console.error("Failed to serialize MDX content", e);

    return content;
  }
}
