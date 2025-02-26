import "server-only";

import React from "react";

import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";

import { DocsLoader } from "@/server/docs-loader";
import { MdxSerializer } from "@/server/mdx-serializer";

import { MdxAsideComponent } from "../../mdx/bundler/component";
import { MdxContent } from "../../mdx/components/MdxContent";
import { asToc, getMDXExport } from "../../mdx/get-mdx-export";
import { LayoutEvaluatorContent } from "./LayoutEvaluatorContent";

export async function LayoutEvaluator({
  loader,
  serialize,
  fallbackTitle,
  pageId,
  breadcrumb,
  bottomNavigation,
}: {
  loader: DocsLoader;
  serialize: MdxSerializer;
  fallbackTitle: string;
  pageId: FernNavigation.PageId;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  bottomNavigation?: React.ReactNode;
}) {
  const { filename, markdown, editThisPageUrl } = await loader.getPage(pageId);
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

  frontmatter["edit-this-page-url"] ??= editThisPageUrl;

  const hasAside =
    exports?.Aside != null && typeof exports.Aside === "function";

  const Aside = hasAside ? (exports.Aside as React.ComponentType) : undefined;

  return (
    <LayoutEvaluatorContent
      serialize={serialize}
      title={frontmatter?.title ?? fallbackTitle}
      subtitle={frontmatter?.subtitle ?? frontmatter?.excerpt}
      frontmatter={frontmatter}
      breadcrumb={breadcrumb}
      tableOfContents={toc}
      aside={mdx && Aside && <Aside />}
      bottomNavigation={bottomNavigation}
    >
      <MdxContent mdx={mdx} fallback={markdown} />
    </LayoutEvaluatorContent>
  );
}
