import type { FernNavigation } from "@fern-api/fdr-sdk";

export function slugToHref(slug: FernNavigation.Slug): string {
    return `/${slug}`;
}
