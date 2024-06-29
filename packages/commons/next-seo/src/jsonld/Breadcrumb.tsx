import Script from "next/script";
import { ReactElement } from "react";
import { BreadcrumbList } from "./types/breadcrumbs";

export function Breadcrumb({ breadcrumbList }: { breadcrumbList: BreadcrumbList }): ReactElement {
    return (
        <Script
            type="application/ld+json"
            id="jsonld-breadcrumb"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(breadcrumbList),
            }}
        />
    );
}
