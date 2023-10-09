/**
 * Joins the given URL slugs with a `/`. Ignores empty ones.
 */
export function joinUrlSlugs(...parts: string[]): string {
    return parts
        .filter((part) => part.length > 0)
        .map(encodeURIComponent)
        .join("/");
}

/**
 * The reverse of `joinUrlSlugs()`.
 */
export function splitFullSlugIntoParts(fullSlug: string): string[] {
    return fullSlug.split("/").map(decodeURIComponent);
}
