import { ChevronRightIcon } from "@radix-ui/react-icons";
import { Fragment, ReactElement } from "react";

export function Breadcrumbs({ breadcrumbs }: { breadcrumbs: string[] }): ReactElement | null {
    if (breadcrumbs.length === 0) {
        return null;
    }
    return (
        <div>
            <span className="inline-flex items-center font-semibold uppercase tracking-wider">
                {breadcrumbs.map((breadcrumb, idx) => (
                    <Fragment key={idx}>
                        {idx > 0 && <ChevronRightIcon className="text-faded mx-0.5" />}
                        <span className="t-accent shrink truncate whitespace-nowrap text-xs">{breadcrumb}</span>
                    </Fragment>
                ))}
            </span>
        </div>
    );
}
