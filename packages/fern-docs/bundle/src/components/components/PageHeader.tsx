import "server-only";

import React from "react";

import type { FernNavigation } from "@fern-api/fdr-sdk";

import { DocsLoader } from "@/server/docs-loader";
import { createCachedMdxSerializer } from "@/server/mdx-serializer";

import { MdxContent } from "../mdx/MdxContent";
import { FernBreadcrumbs } from "./FernBreadcrumbs";

export async function PageHeader({
  loader,
  breadcrumb,
  title: titleProp,
  tags,
  subtitle: subtitleProp,
  children,
}: {
  loader: DocsLoader;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  title: string;
  subtitle?: string;
  tags?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const serialize = createCachedMdxSerializer(loader);

  const [title, subtitle] = await Promise.all([
    serialize(titleProp),
    serialize(subtitleProp),
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
}
