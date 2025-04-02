import "server-only";

import React from "react";

import type { FernNavigation } from "@fern-api/fdr-sdk";

import { MdxServerComponent } from "@/mdx/components/server-component";
import { MdxSerializer } from "@/server/mdx-serializer";

import { FernBreadcrumbs } from "./FernBreadcrumbs";
import { FernLink } from "./FernLink";
import { PageActionsDropdown } from "./PageActionsDropdown";

export function PageHeader({
  slug,
  serialize,
  breadcrumb,
  title,
  titleHref,
  action,
  tags,
  subtitle,
  children,
  markdown,
}: {
  slug: string;
  serialize: MdxSerializer;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  title: string;
  titleHref?: string;
  action?: React.ReactNode;
  subtitle?: string;
  tags?: React.ReactNode;
  children?: React.ReactNode;
  markdown: string;
}) {
  return (
    <header className="my-8 space-y-2">
        {(breadcrumb.length > 0 || tags) && (
          <div className="flex justify-between">
            <FernBreadcrumbs breadcrumb={breadcrumb} />
            {tags}
          </div>
        )}


      <WithAction action={action}>
        <div className="flex flex-row justify-between items-center">
          {titleHref == null ? (
            <h1 className="fern-page-heading hyphens-auto text-balance break-words">
              <MdxServerComponent serialize={serialize} mdx={title} slug={slug} />
            </h1>
          ) : (
            <FernLink href={titleHref} scroll={true}>
              <h1 className="fern-page-heading hyphens-auto text-balance break-words">
                <MdxServerComponent
                  serialize={serialize}
                  mdx={title}
                  slug={slug}
                />
              </h1>
            </FernLink>
          )}
          <div className="w-[135px]">
            <PageActionsDropdown markdown={markdown}/>
          </div>
        </div>

      </WithAction>

      {subtitle && (
        <div className="prose-p:text-(color:--grayscale-a11) mt-2 hyphens-auto break-words leading-7">
          <React.Suspense fallback={subtitle}>
            <MdxServerComponent
              serialize={serialize}
              mdx={subtitle}
              slug={slug}
            />
          </React.Suspense>
        </div>
      )}

      {children}
    </header>
  );
}

function WithAction({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  if (!action) {
    return children;
  }

  return (
    <div className="flex items-center justify-between">
      {children}
      {action}
    </div>
  );
}
