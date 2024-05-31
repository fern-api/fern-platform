export function createSlug(
    baseSlug: string[],
    parentSlug: string[],
    {
        fullSlug,
        urlSlug,
    }: {
        fullSlug?: string[];
        urlSlug: string;
    },
) {
    if (fullSlug != null) {
        if (baseSlug.every((b, i) => b === fullSlug[i])) {
            return fullSlug;
        }
        return [...baseSlug, ...fullSlug];
    }

    return [...parentSlug, urlSlug];
}
