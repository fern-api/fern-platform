import { ChevronRightIcon } from "@radix-ui/react-icons";
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
                        {idx > 0 && <ChevronRightIcon className="text-faded mx-0.5" />}
                        <span className="t-accent shrink truncate whitespace-nowrap text-sm">{breadcrumb}</span>
                    </Fragment>
                ))}
            </span>
        </div>
    );
}
