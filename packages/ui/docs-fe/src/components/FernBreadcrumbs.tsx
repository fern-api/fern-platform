import type { FernNavigation } from "@fern-api/fdr-sdk";
import { NavArrowRight } from "iconoir-react";
import { Fragment, ReactElement } from "react";
import { useToHref } from "../hooks/useHref";
import { FernLink } from "./FernLink";

export interface FernBreadcrumbsProps {
    breadcrumbs: readonly FernNavigation.NavigationBreadcrumbItem[];
}

export function FernBreadcrumbs({ breadcrumbs }: FernBreadcrumbsProps): ReactElement | null {
    const toHref = useToHref();
    const filteredBreadcrumbs = breadcrumbs.filter((item) => item.title.trim().length > 0);

    if (filteredBreadcrumbs.length === 0) {
        return null;
    }
    return (
        <div>
            <span className="fern-breadcrumbs">
                {filteredBreadcrumbs.map((breadcrumb, idx) => (
                    <Fragment key={idx}>
                        {idx > 0 && <NavArrowRight className="fern-breadcrumbs-arrow" />}
                        {breadcrumb.pointsTo != null ? (
                            <FernLink className="fern-breadcrumbs-item" href={toHref(breadcrumb.pointsTo)}>
                                {breadcrumb.title}
                            </FernLink>
                        ) : (
                            <span className="fern-breadcrumbs-item">{breadcrumb.title}</span>
                        )}
                    </Fragment>
                ))}
            </span>
        </div>
    );
}
