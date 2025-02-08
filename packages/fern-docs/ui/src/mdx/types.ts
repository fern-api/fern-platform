import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import type { Options } from "@mdx-js/esbuild";
import { RehypeFilesOptions } from "./plugins/rehype-files";
import { RehypeLinksOptions } from "./plugins/rehype-links";

export type FernSerializeMdxOptions = {
  filename?: string;
  showError?: boolean;
  options?: Options;

  files?: Record<string, string>;
  scope?: Record<string, unknown>;
  replaceSrc?: RehypeFilesOptions["replaceSrc"];
  replaceHref?: RehypeLinksOptions["replaceHref"];
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
