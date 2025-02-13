import React from "react";

import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";

import { DocsLoader } from "@/server/docs-loader";
import { createCachedMdxSerializer } from "@/server/mdx-serializer";

import { MdxContent } from "../mdx/MdxContent";
import { MdxAsideComponent } from "../mdx/bundler/component";
import { asToc, getMDXExport } from "../mdx/get-mdx-export";
import { LayoutEvaluatorContent } from "./LayoutEvaluatorContent";

export async function LayoutEvaluator({
  loader,
  fallbackTitle,
  pageId,
  breadcrumb,
}: {
  loader: DocsLoader;
  fallbackTitle: string;
  pageId: FernNavigation.PageId;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
}) {
  const { filename, markdown } = await loader.getPage(pageId);
  const serialize = createCachedMdxSerializer(loader);
  const mdx = await serialize(markdown, {
    filename,
    toc: true,
  });

  const exports = getMDXExport(mdx);
  const toc = asToc(exports?.toc);
  const frontmatter =
    mdx?.frontmatter ??
    (exports?.frontmatter as Partial<FernDocs.Frontmatter> | undefined) ??
    {};

  const hasAside = exports?.aside != null;

  return (
    <LayoutEvaluatorContent
      loader={loader}
      title={frontmatter?.title ?? fallbackTitle}
      subtitle={frontmatter?.subtitle ?? frontmatter?.excerpt}
      frontmatter={frontmatter}
      breadcrumb={breadcrumb}
      tableOfContents={toc}
      aside={mdx && hasAside && <MdxAsideComponent {...mdx} />}
    >
      <MdxContent mdx={mdx} fallback={markdown} />
    </LayoutEvaluatorContent>
  );
}
