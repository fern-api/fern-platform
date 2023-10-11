import { NavigatableDocsNode } from "./path-resolver";

/**
 * Joins the given URL slugs with a `/`. Ignores empty ones.
 */
export function joinUrlSlugs(...parts: string[]): string {
    return parts.filter((part) => part.length > 0).join("/");
}

/**
 * The reverse of `joinUrlSlugs()`.
 */
export function splitFullSlugIntoParts(fullSlug: string): string[] {
    return fullSlug.split("/").map(decodeURIComponent);
}

export function getFullSlugForNavigatable(node: NavigatableDocsNode): string {
    const parts: string[] = [];
    if (node.context.type === "versioned-tabbed" || node.context.type === "versioned-untabbed") {
        parts.push(node.context.version.info.slug);
    }
    parts.push(node.leadingSlug);
    return joinUrlSlugs(...parts);
}
