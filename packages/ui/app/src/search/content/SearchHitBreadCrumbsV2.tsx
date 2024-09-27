import { NavArrowRight } from "iconoir-react";
import { Fragment, ReactElement } from "react";

interface SearchHitBreadCrumbsV2Props {
    breadcrumb: string[];
}

export function SearchHitBreadCrumbsV2({ breadcrumb }: SearchHitBreadCrumbsV2Props): ReactElement {
    return (
        <>
            {breadcrumb.map((part, index) => (
                <Fragment key={index}>
                    {index > 0 && <NavArrowRight className="mx-0.5 inline-block size-icon-sm" />}
                    <span>{part}</span>
                </Fragment>
            ))}
        </>
    );
}
