import "server-only";

import React from "react";

import type { FernNavigation } from "@fern-api/fdr-sdk";

import { MdxSerializer } from "@/server/mdx-serializer";

import { MdxServerComponent } from "../../mdx/components/server-component";
import { FernBreadcrumbs } from "./FernBreadcrumbs";
import { FernLink } from "./FernLink";

export function PageHeader({
  serialize,
  breadcrumb,
  title,
  titleHref,
  tags,
  subtitle,
  children,
}: {
  serialize: MdxSerializer;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  title: string;
  titleHref?: string;
  subtitle?: string;
  tags?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="my-8 space-y-2">
      {(breadcrumb.length > 0 || tags) && (
        <div className="flex justify-between">
          <FernBreadcrumbs breadcrumb={breadcrumb} />
          {tags}
        </div>
      )}

      {titleHref == null ? (
        <h1 className="text-balance break-words">
          <MdxServerComponent serialize={serialize} mdx={title} />
        </h1>
      ) : (
        <FernLink href={titleHref} className="text-balance break-words">
          <h1 className="text-balance break-words">
            <MdxServerComponent serialize={serialize} mdx={title} />
          </h1>
        </FernLink>
      )}

      {subtitle && (
        <div className="prose-p:text-(color:--grayscale-a11) mt-2 leading-7">
          <React.Suspense fallback={subtitle}>
            <MdxServerComponent serialize={serialize} mdx={subtitle} />
          </React.Suspense>
        </div>
      )}

      {children}
    </header>
  );
}
