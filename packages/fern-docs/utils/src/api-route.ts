import urlJoin from "url-join";

export type FernDocsApiRoute = `/api/fern-docs/${string}`;

interface Options {
  includeTrailingSlash?: boolean;
  basepath?: string;
}

// see useHref.ts for a similar pattern
export function getApiRouteSupplier({
  includeTrailingSlash,
  basepath,
}: Options): (route: FernDocsApiRoute) => string {
  return (route) => {
    // note: if the first argument of urjoin is "", it will strip the leading slash. `|| "/"` ensures "" -> "/"
    if (includeTrailingSlash) {
      return urlJoin(basepath || "/", route, "/");
    } else {
      return urlJoin(basepath || "/", route);
    }
  };
}
