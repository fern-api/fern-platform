export function getRouteForResolvedPath({
    resolvedSlug,
    asPath,
    basePath = "",
}: {
    resolvedSlug: string;
    /** Includes hash. */
    asPath: string;
    basePath?: string;
}): string {
    const [, hash] = asPath.split("#");
    if (typeof hash !== "string" || hash.length === 0) {
        return `${basePath}/${resolvedSlug}`;
    }
    return `${basePath}/${resolvedSlug}#${hash}`;
}
