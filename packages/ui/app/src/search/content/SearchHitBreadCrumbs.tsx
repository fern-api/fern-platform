import type { Algolia } from "@fern-api/fdr-sdk";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { Fragment, ReactElement } from "react";

interface SearchHitBreadCrumbsProps {
    parts: Algolia.AlgoliaRecordPathPart[];
}

export function SearchHitBreadCrumbs({ parts }: SearchHitBreadCrumbsProps): ReactElement {
    return (
        <>
            {parts.map((part, index) => (
                <Fragment key={index}>
                    {index > 0 && <ChevronRightIcon className="mx-0.5 inline-block size-3" />}
                    <span>{part.name}</span>
                </Fragment>
            ))}
        </>
    );
}
