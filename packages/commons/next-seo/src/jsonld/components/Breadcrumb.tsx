import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import Head from "next/head";
import { ReactElement, memo } from "react";

export const Breadcrumb = memo(
    ({ breadcrumbList }: { breadcrumbList: FernDocs.JsonLdBreadcrumbList }): ReactElement => {
        return (
            <Head>
                <script
                    key="jsonld-breadcrumb"
                    type="application/ld+json"
                    id="jsonld-breadcrumb"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(breadcrumbList),
                    }}
                />
            </Head>
        );
    },
);

Breadcrumb.displayName = "JsonLdBreadcrumb";
