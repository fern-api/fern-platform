import type * as FernDocs from "@fern-api/fdr-sdk/docs";

export function listItem(position: number, name: string, item?: string): FernDocs.JsonLdBreadcrumbListElement {
    return {
        "@type": "ListItem",
        position,
        name,
        item,
    };
}

export function breadcrumbList(itemListElement: FernDocs.JsonLdBreadcrumbListElement[]): FernDocs.JsonLdBreadcrumbList {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement,
    };
}
