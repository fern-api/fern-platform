import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { EMPTY_FRONTMATTER } from "@fern-api/fdr-sdk/docs";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";

import { createCachedDocsLoader } from "@/server/docs-loader";

import { MdxContent } from "../mdx/MdxContent";
import { asToc, getMDXExport } from "../mdx/get-mdx-export";
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
    throw new Error(`[${domain}] Could not serialize page: ${pageId}`);
  }
  const exports = getMDXExport(mdx);
  const toc = asToc(exports?.toc);
  const frontmatter: FernDocs.Frontmatter =
    typeof mdx === "string" ? EMPTY_FRONTMATTER : mdx.frontmatter;

  // if the page contains an <Aside> tag, and the layout is not a page or custom layout, set the layout to reference
  if (typeof mdx !== "string" && mdx.code.includes("(ReferenceLayoutAside,")) {
    if (frontmatter.layout !== "page" && frontmatter.layout !== "custom") {
      frontmatter.layout = "reference";
    }
  }

  return (
    <LayoutEvaluatorContent
      domain={domain}
      title={frontmatter.title ?? fallbackTitle}
      subtitle={frontmatter.subtitle ?? frontmatter.excerpt}
      frontmatter={frontmatter}
      breadcrumb={breadcrumb}
      tableOfContents={toc}
      hasAside={hasAside}
    >
      <MdxContent mdx={mdx} />
    </LayoutEvaluatorContent>
  );
}
