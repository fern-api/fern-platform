import "server-only";

import React from "react";

import type { FernNavigation } from "@fern-api/fdr-sdk";

import { MdxSerializer } from "@/server/mdx-serializer";

import {
  MdxServerComponent,
  MdxServerComponentSuspense,
} from "../mdx/server-component";
import { FernBreadcrumbs } from "./FernBreadcrumbs";

export function PageHeader({
  serialize,
  breadcrumb,
  title,
  tags,
  subtitle,
  children,
}: {
  serialize: MdxSerializer;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  title: string;
  subtitle?: string;
  tags?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="my-8 space-y-2">
      <div className="flex justify-between">
        <FernBreadcrumbs breadcrumb={breadcrumb} />
        {tags}
      </div>

      <h1 className="text-balance break-words">
        <MdxServerComponent serialize={serialize} mdx={title} />
      </h1>

      {subtitle && (
        <div className="prose-p:text-muted mt-2 leading-7">
          <MdxServerComponentSuspense
            serialize={serialize}
            mdx={subtitle}
            fallback={subtitle}
          />
        </div>
      )}

      {children}
    </header>
  );
}
