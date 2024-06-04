/**
 * Joins the given URL slugs with a `/`. Ignores empty ones.
 */
export function joinUrlSlugs(...parts: string[]): string {
    return parts
        .map(withoutTrailingSlash)
        .map((part, i) => (i === 0 ? part : withoutLeadingSlash(part)))
        .filter((part) => part.length > 0)
        .join("/");
}

/**
 * The reverse of `joinUrlSlugs()`.
 */
export function splitFullSlugIntoParts(fullSlug: string): string[] {
    return fullSlug.split("/").map(decodeURIComponent);
}

export function getSlugFromUrl({ pathname, basePath }: { pathname: string; basePath: string | undefined }): string {
    const slug = basePath != null ? pathname.replace(new RegExp(`^${basePath}`), "") : pathname;
    return removeLeadingAndTrailingSlashes(slug);
}

function removeLeadingAndTrailingSlashes(s: string): string {
    if (s.startsWith("/")) {
        s = s.substring(1);
    }
    if (s.endsWith("/")) {
        s = s.substring(0, s.length - 1);
    }
    return s;
}

function withoutLeadingSlash(s: string): string {
    return s.startsWith("/") ? s.substring(1) : s;
}

function withoutTrailingSlash(s: string): string {
    return s.endsWith("/") ? s.substring(0, s.length - 1) : s;
}
