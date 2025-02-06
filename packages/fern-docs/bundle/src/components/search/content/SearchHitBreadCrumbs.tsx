import type { Algolia } from "@fern-api/fdr-sdk/client/types";
import { NavArrowRight } from "iconoir-react";
import { Fragment, ReactElement } from "react";

interface SearchHitBreadCrumbsProps {
  parts: Algolia.AlgoliaRecordPathPart[];
}

export function SearchHitBreadCrumbs({
  parts,
}: SearchHitBreadCrumbsProps): ReactElement {
  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <NavArrowRight className="size-icon-sm mx-0.5 inline-block" />
          )}
          <span>{part.name}</span>
        </Fragment>
      ))}
    </>
  );
}
