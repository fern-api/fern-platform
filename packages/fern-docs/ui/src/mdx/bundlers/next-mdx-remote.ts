import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import {
  customHeadingHandler,
  getFrontmatter,
  sanitizeBreaks,
  sanitizeMdxExpression,
  toTree,
  type PluggableList,
} from "@fern-docs/mdx";
import {
  rehypeAcornErrorBoundary,
  rehypeMdxClassStyle,
  rehypeSqueezeParagraphs,
  remarkSanitizeAcorn,
  remarkSqueezeParagraphs,
} from "@fern-docs/mdx/plugins";
import { serialize } from "next-mdx-remote/serialize";
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

type SerializeOptions = NonNullable<Parameters<typeof serialize>[1]>;

function withDefaultMdxOptions(
  { options = {}, replaceSrc }: FernSerializeMdxOptions = {},
  frontmatter: FernDocs.Frontmatter
): SerializeOptions["mdxOptions"] {
  const remarkRehypeOptions = {
    ...options.remarkRehypeOptions,
    handlers: {
      heading: customHeadingHandler,
      ...options.remarkRehypeOptions?.handlers,
    },
  };

  const remarkPlugins: PluggableList = [
    [remarkExtractTitle, { frontmatter }],
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
    [rehypeFiles, { replaceSrc }],
    rehypeAcornErrorBoundary,
    rehypeSlug,
    rehypeKatex,
    rehypeFernCode,
    rehypeFernComponents,
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
  content = sanitizeMdxExpression(content)[0];

  try {
    const { data: frontmatter, content: contentWithoutFrontmatter } =
      getFrontmatter(content);

    const result = await serialize<
      Record<string, unknown>,
      FernDocs.Frontmatter
    >(contentWithoutFrontmatter, {
      scope: options?.scope,
      mdxOptions: withDefaultMdxOptions(options, frontmatter),
      parseFrontmatter: false, // this is parsed above via getFrontmatter
    });

    // TODO: this is doing duplicate work; figure out how to combine it with the compiler above.
    const { jsxElements } = toTree(content, { sanitize: false });

    return {
      engine: "next-mdx-remote",
      code: result.compiledSource,
      frontmatter: frontmatter,
      scope: result.scope,
      jsxRefs: jsxElements,
    };
  } catch (e) {
    // TODO: sentry

    console.error("Failed to serialize MDX content", e);

    return content;
  }
}
