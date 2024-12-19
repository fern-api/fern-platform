import { useAtomValue, type Getter } from "jotai";
import urlJoin from "url-join";
import { BASEPATH_ATOM, TRAILING_SLASH_ATOM } from "../atoms/navigation";

export type FernDocsApiRoute = `/api/fern-docs/${string}`;

interface Options {
    includeTrailingSlash?: boolean;
    basepath?: string;
}

// see useHref.ts for a similar pattern
export function getApiRouteSupplier({ includeTrailingSlash, basepath }: Options): (route: FernDocsApiRoute) => string {
    return (route) => {
        // note: if the first argument of urjoin is "", it will strip the leading slash. `|| "/"` ensures "" -> "/"
        if (includeTrailingSlash) {
            return urlJoin(basepath || "/", route, "/");
        } else {
            return urlJoin(basepath || "/", route);
        }
    };
}

export function useApiRoute(route: FernDocsApiRoute, options?: Options): string {
    const basepath = useAtomValue(BASEPATH_ATOM);
    const includeTrailingSlash = useAtomValue(TRAILING_SLASH_ATOM);
    return getApiRouteSupplier({ includeTrailingSlash, basepath, ...options })(route);
}

export function selectApiRoute(get: Getter, route: FernDocsApiRoute, options?: Options): string {
    const basepath = get(BASEPATH_ATOM);
    const includeTrailingSlash = get(TRAILING_SLASH_ATOM);
    return getApiRouteSupplier({ includeTrailingSlash, basepath, ...options })(route);
}
