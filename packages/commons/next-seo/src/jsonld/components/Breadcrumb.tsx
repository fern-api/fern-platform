import Script from "next/script";
import { ReactElement } from "react";
import { BreadcrumbListSchema } from "../types/breadcrumbs";

export function Breadcrumb({ breadcrumbList }: { breadcrumbList: BreadcrumbListSchema }): ReactElement {
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
