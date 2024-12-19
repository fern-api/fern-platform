import type { FernNavigation } from "@fern-api/fdr-sdk";
import type { ReactElement, ReactNode } from "react";
import { FernBreadcrumbs } from "./FernBreadcrumbs";

interface PageHeaderProps {
  title: ReactNode;
  subtitle: ReactNode | undefined;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
}

export const PageHeader = ({
  breadcrumb,
  title,
  subtitle,
}: PageHeaderProps): ReactElement => {
  return (
    <header className="mb-8">
      <div className="space-y-1">
        <FernBreadcrumbs breadcrumb={breadcrumb} />

        <h1 className="fern-page-heading">{title}</h1>
      </div>

      {/* <Markdown
                mdx={isResolvedMdx(subtitle) ? subtitle : undefined}
                fallback={!isResolvedMdx(subtitle) ? subtitle : undefined}
                size="lg"
                className="mt-2 leading-7 prose-p:t-muted"
            /> */}
      {subtitle != null && (
        <div className="mt-2 leading-7 prose-p:t-muted">{subtitle}</div>
      )}
    </header>
  );
};

// function isResolvedMdx(node: FernDocs.MarkdownText | ReactNode): node is FernDocs.MarkdownText {
//     return typeof node === "string" || (isPlainObject(node) && typeof node.compiledSource === "string");
// }
