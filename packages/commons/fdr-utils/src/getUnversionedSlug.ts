export function getUnversionedSlug(
    slug: readonly string[],
    currentVersionSlug: readonly string[],
    basePathSlug: readonly string[],
): readonly string[] {
    const isVersionMatch =
        currentVersionSlug.length > 0 && currentVersionSlug.every((part, index) => part === slug[index]);

    if (isVersionMatch) {
        return slug.slice(currentVersionSlug.length);
    }

    const isBasePathMatch = basePathSlug.length > 0 && basePathSlug.every((part, index) => part === slug[index]);

    if (isBasePathMatch) {
        return slug.slice(basePathSlug.length);
    }

    return slug;
}
