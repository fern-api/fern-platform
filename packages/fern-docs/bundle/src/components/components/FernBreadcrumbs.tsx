"use client";

import type { FernNavigation } from "@fern-api/fdr-sdk";
import { NavArrowRight } from "iconoir-react";
import { Fragment, ReactElement } from "react";
import { useToHref } from "../hooks/useHref";
import { FernLink } from "./FernLink";

export interface FernBreadcrumbsProps {
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
}

export function FernBreadcrumbs({
  breadcrumb,
}: FernBreadcrumbsProps): ReactElement<any> | null {
  const toHref = useToHref();
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
          {idx > 0 && <NavArrowRight className="fern-breadcrumb-arrow" />}
          {breadcrumb.pointsTo != null ? (
            <FernLink
              className="fern-breadcrumb-item"
              href={toHref(breadcrumb.pointsTo)}
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
