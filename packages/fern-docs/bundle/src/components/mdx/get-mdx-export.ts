import { FernDocs } from "@fern-api/fdr-sdk";
import { isToc, TableOfContentsItem } from "@fern-docs/mdx";
import {
  getMDXExport as getMDXExportOriginal,
  MDXContentProps,
} from "mdx-bundler/client";

export function getMDXExport(
  mdx: FernDocs.MarkdownText | undefined,
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
