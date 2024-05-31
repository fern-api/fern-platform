export function createSlug(
    baseSlug: string[],
    parentSlug: string[],
    {
        fullSlug,
        urlSlug,
        skipUrlSlug,
    }: {
        fullSlug?: string[];
        skipUrlSlug?: boolean;
        urlSlug: string;
    },
) {
    if (fullSlug != null) {
        if (baseSlug.every((b, i) => b === fullSlug[i])) {
            return fullSlug;
        }
        return [...baseSlug, ...fullSlug];
    }

    if (skipUrlSlug) {
        return parentSlug;
    }

    return [...parentSlug, urlSlug];
}
