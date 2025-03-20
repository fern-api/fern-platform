"use client";

import { Fragment, ReactElement } from "react";

import { ChevronRight } from "lucide-react";

import type { FernNavigation } from "@fern-api/fdr-sdk";
import { slugToHref } from "@fern-docs/utils";

import { FernLink } from "./FernLink";

export interface FernBreadcrumbsProps {
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
}

export function FernBreadcrumbs({
  breadcrumb,
}: FernBreadcrumbsProps): ReactElement<any> | null {
  const filteredBreadcrumbs = breadcrumb.filter(
    (item) => item.title.trim().length > 0
  );

  if (filteredBreadcrumbs.length === 0) {
    return null;
  }
  return (
    <span className="fern-breadcrumb">
      {filteredBreadcrumbs.map((breadcrumb, idx) => (
        <Fragment key={idx}>
          {idx > 0 && <ChevronRight className="fern-breadcrumb-arrow" />}
          {breadcrumb.pointsTo != null ? (
            <FernLink
              className="fern-breadcrumb-item"
              href={slugToHref(breadcrumb.pointsTo)}
              scroll={true}
            >
              {breadcrumb.title}
            </FernLink>
          ) : (
            <span className="fern-breadcrumb-item">{breadcrumb.title}</span>
          )}
        </Fragment>
      ))}
    </span>
  );
}
