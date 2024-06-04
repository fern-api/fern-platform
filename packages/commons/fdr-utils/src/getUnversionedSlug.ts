export function getUnversionedSlug(
    slug: string,
    currentVersionSlug: string | undefined,
    basePathSlug: string | undefined,
): string {
    if (
        currentVersionSlug != null &&
        slug.startsWith(currentVersionSlug) &&
        (slug.length === currentVersionSlug.length || slug[currentVersionSlug.length] === "/")
    ) {
        return slug.slice(currentVersionSlug.length);
    }

    if (
        basePathSlug != null &&
        slug.startsWith(basePathSlug) &&
        (slug.length === basePathSlug.length || slug[basePathSlug.length] === "/")
    ) {
        return slug.slice(basePathSlug.length);
    }

    return slug;
}
