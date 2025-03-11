import useSWRImmutable from "swr/immutable";

import { getMetadataAction } from "@/server/actions/metadata";

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
  const { data } = useSWRImmutable("metadata", getMetadataAction);
  return getApiRouteSupplier({ basepath: data?.basePath, ...options })(route);
}
