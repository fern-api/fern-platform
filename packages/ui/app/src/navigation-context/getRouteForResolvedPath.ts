export function getRouteForResolvedPath({
    resolvedSlug,
    asPath,
}: {
    resolvedSlug: string;
    /** Includes hash. */
    asPath: string;
}): string {
    const [, hash] = asPath.split("#");
    if (typeof hash !== "string" || hash.length === 0) {
        return `/${resolvedSlug}`;
    }
    return `/${resolvedSlug}#${hash}`;
}
