import urlJoin from "url-join";

export type FernDocsApiRoute = `/api/fern-docs/${string}`;

export function getApiRouteSupplier({
  includeTrailingSlash,
  basepath,
}: {
  includeTrailingSlash?: boolean;
  basepath?: string;
}): (route: FernDocsApiRoute) => string {
  return (route) => {
    // note: if the first argument of urjoin is "", it will strip the leading slash. `|| "/"` ensures "" -> "/"
    if (includeTrailingSlash) {
      return urlJoin(basepath || "/", route, "/");
    } else {
      return urlJoin(basepath || "/", route);
    }
  };
}
