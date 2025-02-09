import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import type { TableOfContentsItem } from "@fern-docs/mdx";
import { ReactElement, ReactNode } from "react";
import { UnreachableCaseError } from "ts-essentials";
import { PageHeader } from "../components/PageHeader";
import { CustomLayout } from "./CustomLayout";
import { GuideLayout } from "./GuideLayout";
import { OverviewLayout } from "./OverviewLayout";
import { PageLayout } from "./PageLayout";
import { ReferenceLayout } from "./ReferenceLayout";
import { TableOfContentsLayout } from "./TableOfContentsLayout";

interface LayoutEvaluatorProps {
  domain: string;
  frontmatter: FernDocs.Frontmatter;
  title: string;
  subtitle?: string;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  tableOfContents: TableOfContentsItem[];
  children: ReactNode;
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
  hasAside,
}: LayoutEvaluatorProps): ReactElement<any> {
  const layout = frontmatter.layout ?? "guide";

  const PageHeaderComponent = () => {
    return (
      <PageHeader
        domain={domain}
        title={title}
        subtitle={subtitle}
        breadcrumb={breadcrumb}
      />
    );
  };

  const TableOfContentsComponent = () => {
    return (
      <TableOfContentsLayout
        tableOfContents={tableOfContents}
        hideTableOfContents={frontmatter["hide-toc"]}
      />
    );
  };

  switch (layout) {
    case "custom":
      return <CustomLayout>{children}</CustomLayout>;
    case "guide":
      return (
        <GuideLayout
          PageHeader={PageHeaderComponent}
          TableOfContents={TableOfContentsComponent}
          editThisPageUrl={frontmatter["edit-this-page-url"]}
          hideFeedback={frontmatter["hide-feedback"]}
          hideNavLinks={frontmatter["hide-nav-links"]}
        >
          {children}
        </GuideLayout>
      );
    case "overview":
      return (
        <OverviewLayout
          PageHeader={PageHeaderComponent}
          TableOfContents={TableOfContentsComponent}
          editThisPageUrl={frontmatter["edit-this-page-url"]}
          hideFeedback={frontmatter["hide-feedback"]}
        >
          {children}
        </OverviewLayout>
      );
    case "page":
      return (
        <PageLayout
          PageHeader={PageHeaderComponent}
          editThisPageUrl={frontmatter["edit-this-page-url"]}
          hideFeedback={frontmatter["hide-feedback"]}
          hideNavLinks={frontmatter["hide-nav-links"]}
        >
          {children}
        </PageLayout>
      );
    case "reference":
      return (
        <ReferenceLayout
          header={<PageHeaderComponent />}
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
