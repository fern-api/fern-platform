/**
 * Handles the query parameters of `req.query` and `req.headers` when they are potentially an array.
 */
export function selectFirst(
    param: string | string[] | null | undefined
): string | undefined {
    if (Array.isArray(param)) {
        return param[0];
    }
    return param ?? undefined;
}
