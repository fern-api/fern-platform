import Head from "next/head";
import { ReactElement, memo } from "react";
import { BreadcrumbListSchema } from "../types/breadcrumbs";

export const Breadcrumb = memo(({ breadcrumbList }: { breadcrumbList: BreadcrumbListSchema }): ReactElement => {
    return (
        <Head>
            <script
                type="application/ld+json"
                id="jsonld-breadcrumb"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbList),
                }}
            />
        </Head>
    );
});

Breadcrumb.displayName = "JsonLdBreadcrumb";
