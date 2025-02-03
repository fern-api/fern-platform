import type { FernNavigation } from "@fern-api/fdr-sdk";
import { ChevronRight } from "lucide-react";
import { Fragment, ReactElement } from "react";
import { FernLink } from "../../components/link";
import { useToHref } from "../hooks/useHref";

export interface FernBreadcrumbsProps {
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
}

export function FernBreadcrumbs({
  breadcrumb,
}: FernBreadcrumbsProps): ReactElement | null {
  const toHref = useToHref();
  const filteredBreadcrumbs = breadcrumb.filter(
    (item) => item.title.trim().length > 0
  );

  if (filteredBreadcrumbs.length === 0) {
    return null;
  }
  return (
    <div>
      <span className="fern-breadcrumb">
        {filteredBreadcrumbs.map((breadcrumb, idx) => (
          <Fragment key={idx}>
            {idx > 0 && <ChevronRight className="fern-breadcrumb-arrow" />}
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
    </div>
  );
}
