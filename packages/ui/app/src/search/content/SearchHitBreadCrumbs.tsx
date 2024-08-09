import type { Algolia } from "@fern-api/fdr-sdk/client/types";
import { ChevronRight } from "@fern-ui/icons";
import { Fragment, ReactElement } from "react";

interface SearchHitBreadCrumbsProps {
    parts: Algolia.AlgoliaRecordPathPart[];
}

export function SearchHitBreadCrumbs({ parts }: SearchHitBreadCrumbsProps): ReactElement {
    return (
        <>
            {parts.map((part, index) => (
                <Fragment key={index}>
                    {index > 0 && <ChevronRight className="mx-0.5 inline-block size-icon-sm" />}
                    <span>{part.name}</span>
                </Fragment>
            ))}
        </>
    );
}
