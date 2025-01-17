import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import type { Options } from "@mdx-js/esbuild";

export type FernSerializeMdxOptions = {
  parseFrontmatter?: boolean; // default: true
  filename?: string;
  showError?: boolean;
  options?: Options;

  files?: Record<string, string>;
  scope?: Record<string, unknown>;
};

export type SerializeMdxFunc =
  | ((
      content: string,
      options?: FernSerializeMdxOptions
    ) => Promise<FernDocs.MarkdownText>)
  | ((
      content: string | undefined,
      options?: FernSerializeMdxOptions
    ) => Promise<FernDocs.MarkdownText | undefined>);
