import Head from "next/head";
import { ReactElement } from "react";
import { BreadcrumbListSchema } from "../types/breadcrumbs";

export function Breadcrumb({ breadcrumbList }: { breadcrumbList: BreadcrumbListSchema }): ReactElement {
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
}
