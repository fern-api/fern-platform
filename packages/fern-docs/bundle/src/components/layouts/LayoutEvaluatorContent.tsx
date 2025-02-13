import React from "react";

import { UnreachableCaseError } from "ts-essentials";

import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import type { TableOfContentsItem } from "@fern-docs/mdx";

import { DocsLoader } from "@/server/docs-loader";

import { PageHeader } from "../components/PageHeader";
import { CustomLayout } from "./CustomLayout";
import { GuideLayout } from "./GuideLayout";
import { OverviewLayout } from "./OverviewLayout";
import { PageLayout } from "./PageLayout";
import { ReferenceLayout } from "./ReferenceLayout";
import { TableOfContentsLayout } from "./TableOfContentsLayout";

export async function LayoutEvaluatorContent({
  loader,
  frontmatter,
  title,
  subtitle,
  breadcrumb,
  tableOfContents,
  children,
  aside,
}: {
  loader: DocsLoader;
  frontmatter?: Partial<FernDocs.Frontmatter>;
  title: string;
  subtitle?: string;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  tableOfContents: TableOfContentsItem[];
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  let layout = frontmatter?.layout ?? "guide";

  if (aside) {
    layout = "reference";
  }

  const pageHeader = (
    <PageHeader
      loader={loader}
      title={title}
      subtitle={subtitle}
      breadcrumb={breadcrumb}
    />
  );

  const toc = (
    <TableOfContentsLayout
      tableOfContents={tableOfContents}
      hideTableOfContents={frontmatter?.["hide-toc"]}
    />
  );

  switch (layout) {
    case "custom":
      return <CustomLayout>{children}</CustomLayout>;
    case "guide":
      return (
        <GuideLayout
          header={pageHeader}
          toc={toc}
          editThisPageUrl={frontmatter?.["edit-this-page-url"]}
          hideFeedback={frontmatter?.["hide-feedback"]}
          hideNavLinks={frontmatter?.["hide-nav-links"]}
        >
          {children}
        </GuideLayout>
      );
    case "overview":
      return (
        <OverviewLayout
          header={pageHeader}
          toc={toc}
          editThisPageUrl={frontmatter?.["edit-this-page-url"]}
          hideFeedback={frontmatter?.["hide-feedback"]}
        >
          {children}
        </OverviewLayout>
      );
    case "page":
      return (
        <PageLayout
          header={pageHeader}
          editThisPageUrl={frontmatter?.["edit-this-page-url"]}
          hideFeedback={frontmatter?.["hide-feedback"]}
          hideNavLinks={frontmatter?.["hide-nav-links"]}
        >
          {children}
        </PageLayout>
      );
    case "reference":
      return (
        <ReferenceLayout
          header={pageHeader}
          aside={aside}
          // PageHeader={PageHeaderComponent}
          // editThisPageUrl={frontmatter["edit-this-page-url"]}
          // hideFeedback={frontmatter["hide-feedback"]}
          // hasAside={hasAside}
        >
          {children}
        </ReferenceLayout>
      );
    default:
      throw new UnreachableCaseError(layout);
  }
}
