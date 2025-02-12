import React from "react";

import { UnreachableCaseError } from "ts-essentials";

import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import type { TableOfContentsItem } from "@fern-docs/mdx";

import { PageHeader } from "../components/PageHeader";
import { CustomLayout } from "./CustomLayout";
import { GuideLayout } from "./GuideLayout";
import { OverviewLayout } from "./OverviewLayout";
import { PageLayout } from "./PageLayout";
import { ReferenceLayout } from "./ReferenceLayout";
import { TableOfContentsLayout } from "./TableOfContentsLayout";

interface LayoutEvaluatorProps {
  domain: string;
  frontmatter?: Partial<FernDocs.Frontmatter>;
  title: string;
  subtitle?: string;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  tableOfContents: TableOfContentsItem[];
  children: React.ReactNode;
  hasAside: boolean;
}

export function LayoutEvaluatorContent({
  domain,
  frontmatter,
  title,
  subtitle,
  breadcrumb,
  tableOfContents,
  children,
  // hasAside,
}: LayoutEvaluatorProps) {
  const layout = frontmatter?.layout ?? "guide";

  const pageHeader = (
    <PageHeader
      domain={domain}
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
