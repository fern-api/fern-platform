import { ChevronRight } from "lucide-react";
import { Fragment, ReactElement } from "react";

interface SearchHitBreadCrumbsV2Props {
  breadcrumb: string[];
}

export function SearchHitBreadCrumbsV2({
  breadcrumb,
}: SearchHitBreadCrumbsV2Props): ReactElement {
  return (
    <>
      {breadcrumb.map((part, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="size-icon-sm mx-0.5 inline-block" />
          )}
          <span>{part}</span>
        </Fragment>
      ))}
    </>
  );
}
