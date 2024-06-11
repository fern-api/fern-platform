import { ChevronRightIcon } from "@radix-ui/react-icons";
import { Fragment, ReactElement } from "react";

interface SearchHitBreadCrumbsV2Props {
    breadcrumbs: string[];
}

export function SearchHitBreadCrumbsV2({ breadcrumbs }: SearchHitBreadCrumbsV2Props): ReactElement {
    return (
        <>
            {breadcrumbs.map((part, index) => (
                <Fragment key={index}>
                    {index > 0 && <ChevronRightIcon className="mx-0.5 inline-block size-3" />}
                    <span>{part}</span>
                </Fragment>
            ))}
        </>
    );
}
