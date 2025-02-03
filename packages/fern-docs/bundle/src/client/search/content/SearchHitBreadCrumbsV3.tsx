import { NavArrowRight } from "iconoir-react";
import { Fragment, ReactElement } from "react";

interface SearchHitBreadCrumbsV3Props {
  breadcrumb: {
    title: string;
    slug: string;
  }[];
}

export function SearchHitBreadCrumbsV3({
  breadcrumb,
}: SearchHitBreadCrumbsV3Props): ReactElement {
  return (
    <>
      {breadcrumb.map(({ title }, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <NavArrowRight className="size-icon-sm mx-0.5 inline-block" />
          )}
          <span>{title}</span>
        </Fragment>
      ))}
    </>
  );
}
