import { ChevronRightIcon } from "@radix-ui/react-icons";
import { Fragment, ReactElement } from "react";

export function Breadcrumbs({ breadcrumbs }: { breadcrumbs: readonly string[] }): ReactElement | null {
    if (breadcrumbs.length === 0) {
        return null;
    }
    return (
        <div className="mb-4">
            <span className="inline-flex items-center">
                {breadcrumbs.map((breadcrumb, idx) => (
                    <Fragment key={idx}>
                        {idx > 0 && <ChevronRightIcon className="mx-1 text-faded" />}
                        <span className="t-muted shrink truncate whitespace-nowrap text-sm">{breadcrumb}</span>
                    </Fragment>
                ))}
            </span>
        </div>
    );
}
