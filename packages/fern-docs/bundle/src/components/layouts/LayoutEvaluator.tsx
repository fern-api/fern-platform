import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";

import { createCachedDocsLoader } from "@/server/docs-loader";
import { createCachedMdxSerializer } from "@/server/mdx-serializer";

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
  const loader = await createCachedDocsLoader(domain);
  const { filename, markdown } = await loader.getPage(pageId);
  const serialize = createCachedMdxSerializer(domain);
  const mdx = await serialize(markdown, {
    filename,
    toc: true,
  });

  const exports = getMDXExport(mdx);
  const toc = asToc(exports?.toc);
  const frontmatter =
    mdx?.frontmatter ??
    (exports?.frontmatter as Partial<FernDocs.Frontmatter> | undefined);

  // // if the page contains an <Aside> tag, and the layout is not a page or custom layout, set the layout to reference
  // if (mdx?.code.includes("(ReferenceLayoutAside,")) {
  //   if (frontmatter?.layout !== "page" && frontmatter?.layout !== "custom") {
  //     frontmatter.layout = "reference";
  //   }
  // }

  return (
    <LayoutEvaluatorContent
      domain={domain}
      title={frontmatter?.title ?? fallbackTitle}
      subtitle={frontmatter?.subtitle ?? frontmatter?.excerpt}
      frontmatter={frontmatter}
      breadcrumb={breadcrumb}
      tableOfContents={toc}
      hasAside={hasAside}
    >
      <MdxContent mdx={mdx} />
    </LayoutEvaluatorContent>
  );
}
