import { NavArrowRight } from "iconoir-react";
import { Fragment, ReactElement } from "react";

interface SearchHitBreadCrumbsV2Props {
    breadcrumbs: string[];
}

export function SearchHitBreadCrumbsV2({ breadcrumbs }: SearchHitBreadCrumbsV2Props): ReactElement {
    return (
        <>
            {breadcrumbs.map((part, index) => (
                <Fragment key={index}>
                    {index > 0 && <NavArrowRight className="size-icon-sm mx-0.5 inline-block" />}
                    <span>{part}</span>
                </Fragment>
            ))}
        </>
    );
}
