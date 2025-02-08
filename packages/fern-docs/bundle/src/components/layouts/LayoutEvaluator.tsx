import { createCachedDocsLoader } from "@/server/docs-loader";
import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { EMPTY_FRONTMATTER } from "@fern-api/fdr-sdk/docs";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { notFound } from "next/navigation";
import { asToc, getMDXExport } from "../mdx/get-mdx-export";
import { MdxContent } from "../mdx/MdxContent";
import { LayoutEvaluatorContent } from "./LayoutEvaluatorContent";

export interface LayoutEvaluatorProps {
  domain: string;
  fallbackTitle: string;
  pageId: FernNavigation.PageId;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  hasAside: boolean;
}

export async function LayoutEvaluator({
  domain,
  fallbackTitle,
  pageId,
  breadcrumb,
  hasAside,
}: LayoutEvaluatorProps) {
  const docsLoader = await createCachedDocsLoader(domain);
  const mdx = await docsLoader.getSerializedPage(pageId);
  if (mdx == null) {
    notFound();
  }
  const exports = getMDXExport(mdx);
  const toc = asToc(exports?.toc);
  const frontmatter: FernDocs.Frontmatter =
    typeof mdx === "string" ? EMPTY_FRONTMATTER : mdx.frontmatter;

  const [title, subtitle] = await Promise.all([
    docsLoader.serializeMdx(frontmatter.title),
    docsLoader.serializeMdx(frontmatter.subtitle),
  ]);

  return (
    <LayoutEvaluatorContent
      title={<MdxContent mdx={title} fallback={fallbackTitle} />}
      subtitle={subtitle ? <MdxContent mdx={subtitle} /> : undefined}
      frontmatter={frontmatter}
      breadcrumb={breadcrumb}
      tableOfContents={toc}
      hasAside={hasAside}
    >
      <MdxContent mdx={mdx} />
    </LayoutEvaluatorContent>
  );
}
