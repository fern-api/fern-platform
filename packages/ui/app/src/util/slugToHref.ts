import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";

export function slugToHref(slug: FernNavigation.Slug): string {
    return `/${slug}`;
}
