import { ReactElement, memo } from "react";
import { BreadcrumbList, WithContext } from "schema-dts";

export const Breadcrumb = memo(
  ({
    breadcrumbList,
  }: {
    breadcrumbList: WithContext<BreadcrumbList>;
  }): ReactElement => {
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbList),
        }}
      />
    );
  }
);

Breadcrumb.displayName = "JsonLdBreadcrumb";
