import "server-only";

import { createCachedDocsLoader } from "@/server/docs-loader";
import type { FernNavigation } from "@fern-api/fdr-sdk";
import React from "react";
import { MdxContent } from "../mdx/MdxContent";
import { FernBreadcrumbs } from "./FernBreadcrumbs";

export const PageHeader = async ({
  domain,
  breadcrumb,
  title: titleProp,
  tags,
  subtitle: subtitleProp,
  children,
}: {
  domain: string;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  title: string;
  subtitle?: string;
  tags?: React.ReactNode;
  children?: React.ReactNode;
}) => {
  const docsLoader = await createCachedDocsLoader(domain);

  const [title, subtitle] = await Promise.all([
    docsLoader.serializeMdx(titleProp, { stripParagraph: true }),
    docsLoader.serializeMdx(subtitleProp),
  ]);

  return (
    <header className="my-8 space-y-2">
      <div className="flex justify-between">
        <FernBreadcrumbs breadcrumb={breadcrumb} />
        {tags}
      </div>

      <h1 className="text-balance break-words">
        <MdxContent mdx={title} fallback={titleProp} />
      </h1>

      {subtitleProp && (
        <div className="prose-p:t-muted mt-2 leading-7">
          <MdxContent mdx={subtitle} fallback={subtitleProp} />
        </div>
      )}

      {children}
    </header>
  );
};
