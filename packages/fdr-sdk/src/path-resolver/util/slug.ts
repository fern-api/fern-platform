import type { NavigatableDocsNode } from "../types";

/**
 * Joins the given URL slugs with a `/`. Ignores empty ones.
 */
export function joinUrlSlugs(...parts: string[]): string {
    return parts.filter((part) => part.length > 0).join("/");
}

type GetFullSlugForNavigatableOpts = {
    omitDefault?: boolean;
};

export function getFullSlugForNavigatable(node: NavigatableDocsNode, opts?: GetFullSlugForNavigatableOpts): string {
    const { omitDefault = false } = opts ?? {};
    const parts: string[] = [];
    if (node.context.type === "versioned-tabbed" || node.context.type === "versioned-untabbed") {
        if (node.context.version.info.index !== 0 || !omitDefault) {
            parts.push(node.context.version.info.slug);
        }
    }
    parts.push(node.leadingSlug);
    return joinUrlSlugs(...parts);
}
