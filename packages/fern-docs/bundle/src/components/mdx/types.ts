import type { Options } from "@mdx-js/esbuild";

import type * as FernDocs from "@fern-api/fdr-sdk/docs";

import { RehypeFilesOptions } from "./plugins/rehype-files";

export type FernSerializeMdxOptions = {
  filename?: string;
  showError?: boolean;
  options?: Options;
  stripParagraph?: boolean;

  files?: Record<string, string>;
  scope?: Record<string, unknown>;
  replaceSrc?: RehypeFilesOptions["replaceSrc"];
  /**
   * @default false
   */
  toc?: boolean;
};

export type SerializeMdxFunc =
  | ((
      content: string,
      options?: FernSerializeMdxOptions
    ) => Promise<string | FernDocs.ResolvedMdx>)
  | ((
      content: string | undefined,
      options?: FernSerializeMdxOptions
    ) => Promise<string | FernDocs.ResolvedMdx | undefined>);
