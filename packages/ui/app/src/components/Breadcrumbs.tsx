import { NavArrowRight } from "iconoir-react";
import { Fragment, ReactElement } from "react";

export function Breadcrumbs({ breadcrumbs }: { breadcrumbs: readonly string[] }): ReactElement | null {
    if (breadcrumbs.length === 0) {
        return null;
    }
    return (
        <div>
            <span className="inline-flex items-center font-semibold">
                {breadcrumbs.map((breadcrumb, idx) => (
                    <Fragment key={idx}>
                        {idx > 0 && <NavArrowRight className="mx-0.5 text-faded size-4" />}
                        <span className="t-accent shrink truncate whitespace-nowrap text-sm">{breadcrumb}</span>
                    </Fragment>
                ))}
            </span>
        </div>
    );
}
