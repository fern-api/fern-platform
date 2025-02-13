import { useBasePath } from "@/state/navigation";

import { getApiRouteSupplier } from "../util/getApiRouteSupplier";

export type FernDocsApiRoute = `/api/fern-docs/${string}`;

interface Options {
  includeTrailingSlash?: boolean;
  basepath?: string;
}

export function useApiRoute(
  route: FernDocsApiRoute,
  options?: Options
): string {
  const basepath = useBasePath();
  return getApiRouteSupplier({ basepath, ...options })(route);
}
