import React from "react";

import { Separator } from "@radix-ui/react-separator";
import { UnreachableCaseError } from "ts-essentials";

import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import type { TableOfContentsItem } from "@fern-docs/mdx";

import { DocsLoader } from "@/server/docs-loader";

import { BuiltWithFern } from "../built-with-fern";
import { EditThisPageButton } from "../components/EditThisPage";
import { PageHeader } from "../components/PageHeader";
import { Feedback } from "../feedback/Feedback";
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
  bottomNavigation,
}: {
  loader: DocsLoader;
  frontmatter?: Partial<FernDocs.Frontmatter>;
  title: string;
  subtitle?: string;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  tableOfContents: TableOfContentsItem[];
  children: React.ReactNode;
  aside?: React.ReactNode;
  bottomNavigation?: React.ReactNode;
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

  const footer = (
    <Footer
      hideFeedback={frontmatter?.["hide-feedback"]}
      hideNavLinks={frontmatter?.["hide-nav-links"]}
      editThisPageUrl={frontmatter?.["edit-this-page-url"]}
      bottomNavigation={bottomNavigation}
    />
  );

  switch (layout) {
    case "custom":
      return (
        <CustomLayout footer={<BuiltWithFern className="mx-auto my-8 w-fit" />}>
          {children}
        </CustomLayout>
      );
    case "guide":
      return (
        <GuideLayout header={pageHeader} toc={toc} footer={footer}>
          {children}
        </GuideLayout>
      );
    case "overview":
      return (
        <OverviewLayout header={pageHeader} toc={toc} footer={footer}>
          {children}
        </OverviewLayout>
      );
    case "page":
      return (
        <PageLayout header={pageHeader} footer={footer}>
          {children}
        </PageLayout>
      );
    case "reference":
      return (
        <ReferenceLayout header={pageHeader} aside={aside} footer={footer}>
          {children}
        </ReferenceLayout>
      );
    default:
      throw new UnreachableCaseError(layout);
  }
}

function Footer({
  hideFeedback,
  hideNavLinks,
  editThisPageUrl,
  bottomNavigation,
}: {
  hideFeedback?: boolean;
  hideNavLinks?: boolean;
  editThisPageUrl?: string;
  bottomNavigation?: React.ReactNode;
}) {
  return (
    <footer className="my-12 space-y-8">
      <div className="flex gap-4 max-sm:flex-col sm:justify-between">
        <div>{!hideFeedback && <Feedback />}</div>
        <EditThisPageButton editThisPageUrl={editThisPageUrl} />
      </div>

      {!hideNavLinks && bottomNavigation}

      <Separator className="h-px bg-[var(--grayscale-a5)]" />

      <BuiltWithFern className="mx-auto w-fit" />
    </footer>
  );
}
