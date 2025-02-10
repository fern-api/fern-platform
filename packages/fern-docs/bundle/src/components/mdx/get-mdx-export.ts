import {
  MDXContentProps,
  getMDXExport as getMDXExportOriginal,
} from "mdx-bundler/client";

import { FernDocs } from "@fern-api/fdr-sdk";
import { TableOfContentsItem, isToc } from "@fern-docs/mdx";

export function getMDXExport(
  mdx: string | FernDocs.ResolvedMdx | undefined,
  useMDXComponents: () => unknown = () => ({})
):
  | {
      ["default"]: React.ComponentType<MDXContentProps>;
      [key: string]: unknown;
    }
  | undefined {
  if (mdx == null) {
    return undefined;
  }
  return typeof mdx !== "string"
    ? getMDXExportOriginal(mdx.code, {
        // allows us to use MDXProvider to pass components to children
        MdxJsReact: { useMDXComponents },
      })
    : undefined;
}

export function asToc(unknown: unknown): TableOfContentsItem[] {
  if (isToc(unknown)) {
    return unknown;
  }
  return [];
}
