import { getApiRouteSupplier } from "@fern-docs/utils";
import { Getter, useAtomValue } from "jotai";
import { BASEPATH_ATOM, TRAILING_SLASH_ATOM } from "../atoms";

export type FernDocsApiRoute = `/api/fern-docs/${string}`;

interface Options {
  includeTrailingSlash?: boolean;
  basepath?: string;
}

export function useApiRoute(
  route: FernDocsApiRoute,
  options?: Options
): string {
  const basepath = useAtomValue(BASEPATH_ATOM);
  const includeTrailingSlash = useAtomValue(TRAILING_SLASH_ATOM);
  return getApiRouteSupplier({ includeTrailingSlash, basepath, ...options })(
    route
  );
}

export function selectApiRoute(
  get: Getter,
  route: FernDocsApiRoute,
  options?: Options
): string {
  const basepath = get(BASEPATH_ATOM);
  const includeTrailingSlash = get(TRAILING_SLASH_ATOM);
  return getApiRouteSupplier({ includeTrailingSlash, basepath, ...options })(
    route
  );
}
